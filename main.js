const process = require('process');
const path = require('path');
const dotenv = require('dotenv');

let test_case = process.argv[2];
let environment = process.argv[3] || "develop";

var runner = require('./lib/runner');

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

runner.runTestCase(`./test_cases/${test_case}`, endpointUrl, environment);