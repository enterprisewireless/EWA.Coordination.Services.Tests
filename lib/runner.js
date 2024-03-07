const dotenv = require('dotenv');
const path = require('path');

var authentication = require('./authentication');
var api = require('./api');
var fileUtilities = require('./fileUtilities');
var difference = require('./difference');

module.exports = {
  runTestCase: async function(pathToTestCase, endpointUrl, environment) {
    dotenv.config({
      path: path.resolve(__dirname, `../${environment}.env`)
    });

    let authorizationFormData = authentication.getAuthorizationFormData(environment);
    let bearerToken = await authentication.getBearerToken(process.env.TENANT_ID, authorizationFormData);
    let requestBody = fileUtilities.readJSONFile(`${pathToTestCase}/nxgen_input.json`);
    let response = await api.execute(environment, bearerToken, endpointUrl, requestBody);
    fileUtilities.writeJSONToFile(`${pathToTestCase}/nxgen_output_${environment}.json`, response.data);
    difference.checkDifference(
      `${pathToTestCase}/legacy_results.csv`,
      `${pathToTestCase}/nxgen_output_${environment}.json`,
      `${pathToTestCase}/differences_${environment}.json`);
  }
}
