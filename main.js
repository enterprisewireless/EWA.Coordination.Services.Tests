const process = require('process');
const path = require('path');
const dotenv = require('dotenv');
var runner = require('./lib/runner');
var api = require('./lib/api');

let test_case = process.argv[2];
let environment;
if(process.argv[3] != "local" && process.argv[3] != "develop" && process.argv[3] != "release" && process.argv[3] != "prod-test") {
  environment = "develop";
}
else {
  environment = process.argv[3];
}
let endpointUrl = api.get_endpoint_url(environment);

let options = {}
// Retrieve the value after --exclude and remove all whitespace
const useExistingOutputIndex = process.argv.indexOf('--use-existing-output');
options["use-existing-output"] = useExistingOutputIndex == -1 ? false : true;

runner.runTestCase(`./test_cases/${test_case}`, endpointUrl, environment, options);