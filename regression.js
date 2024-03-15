const process = require('process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const chalk = require('chalk');
var runner = require('./lib/runner');
var api = require('./lib/api');

let environment = process.argv[2] || "develop";
var endpointUrl = api.get_endpoint_url(environment);

// Retrieve the value after --exclude and remove all whitespace
const excludeIndex = process.argv.indexOf('--exclude');
let excludeValue;
if (excludeIndex > -1) {
  excludeValue = process.argv[excludeIndex + 1].replace(/\s/g, '');
}
let excludeList = excludeValue ? excludeValue.split(',') : [];

// Get list of directories in test_cases
const testCases = fs.readdirSync('./test_cases');

// Iterate over test_cases ignoreing the ones in the exclude list
runRegressionTest(testCases, endpointUrl, environment);
async function runRegressionTest(testCases, endpointUrl, environment) {
  for (const test_case of testCases) {
    if (!excludeList.includes(test_case)) {
      try {
        await runner.runTestCase(`./test_cases/${test_case}`, endpointUrl, environment);
      } catch (error) {
        console.error(chalk.red(`${test_case} had an error: ${error}`));
      }
    }
  }
}
