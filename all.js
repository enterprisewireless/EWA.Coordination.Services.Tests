const process = require('process');
const path = require('path');
const dotenv = require('dotenv');

var runner = require('./lib/runner');
var fileUtilities = require('./lib/fileUtilities');

let environment = process.argv[2] || "develop";

dotenv.config({
  path: path.resolve(__dirname, `${environment}.env`)
});

let endpointUrl;
switch(environment) {
  case "local":
    endpointUrl = 'https://localhost:7200/v1/Fcc601Application/External';
    break;
  case "develop":
    endpointUrl = 'https://coordination.azure-api.net/validate/v1/Fcc601Application/External?=';
    break;
  case "release":
    endpointUrl = 'https://coordinationservicesrelease.azure-api.net/validate/v1/Fcc601Application/External?=';
    break;
}

testCases = fileUtilities.getDirectoryNames('./test_cases');
console.log(testCases);

testCases.forEach(testCase => {
  runner.runTestCase(`./test_cases/${testCase}`, endpointUrl, environment);
});
