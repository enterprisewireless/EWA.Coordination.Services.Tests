const dotenv = require('dotenv');
const path = require('path');
const chalk = require('chalk');
var authentication = require('./authentication');
var api = require('./api');
var fileUtilities = require('./fileUtilities');
var difference = require('./difference');

module.exports = {
  runTestCase: async function(pathToTestCase, endpointUrl, environment) {
    console.log(`Running test case: ${pathToTestCase} on environment: ${environment}`);

    dotenv.config({
      path: path.resolve(__dirname, `../${environment}.env`)
    });

    let authorizationFormData = await authentication.getAuthorizationFormData(environment);
    let bearerToken = await authentication.getBearerToken(process.env.TENANT_ID, authorizationFormData);
    let requestBody = await fileUtilities.readJSONFile(`${pathToTestCase}/nxgen_input.json`);
    let response = await api.execute(environment, bearerToken, endpointUrl, requestBody, pathToTestCase);
    await fileUtilities.writeJSONToFile(`${pathToTestCase}/nxgen_output_${environment}.json`, response.data);
    try {
      await difference.checkDifference(
      `${pathToTestCase}/legacy_results.csv`,
      `${pathToTestCase}/nxgen_output_${environment}.json`,
      `${pathToTestCase}/differences_${environment}.json`);
    } catch (error) {
      console.error(chalk.red(`Error checking difference for test case: ${pathToTestCase}: ${error}`));
    }
  }
}
