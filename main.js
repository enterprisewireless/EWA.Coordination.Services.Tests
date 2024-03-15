const process = require('process');
const path = require('path');
const dotenv = require('dotenv');
var runner = require('./lib/runner');
var api = require('./lib/api');

let test_case = process.argv[2];

let environment = process.argv[3] || "develop";
let endpointUrl = api.get_endpoint_url(environment);

runner.runTestCase(`./test_cases/${test_case}`, endpointUrl, environment);