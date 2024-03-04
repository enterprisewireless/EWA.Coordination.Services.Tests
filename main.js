const fs = require('fs');
var parser = require('csv-parse');
const process = require('process');
const axios = require('axios');
const path = require('path');
const https = require('https');
const qs = require('querystring');
const dotenv = require('dotenv');

let test_case = process.argv[2];
let environment = process.argv[3] || "develop";
dotenv.config({
  path: path.resolve(__dirname, `${environment}.env`)
});

const authorizationFormData = {
  grant_type: 'client_credentials',
  client_secret: process.env.CLIENT_SECRET,
  client_id: process.env.CLIENT_ID,
  scope: process.env.SCOPE
};

let bearerToken;

axios({
  method: 'post',
  url: `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
  data: authorizationFormData,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
    .then(response => {
        bearerToken = response.data.access_token;
        // Make HTTP POST request with request body
        if(environment == "local") {
          const httpsAgent = new https.Agent({
            rejectUnauthorized: false
          });

          console.log(endpointUrl);
          axios({
            method: 'post',
            url: endpointUrl,
            data: requestBody, 
            headers: {'Authorization': `Bearer ${bearerToken}`}, 
            httpsAgent: httpsAgent
          })
          .then(response => {
              // Write response body to JSON file
              writeJSONToFile(responseBodyFilePath, response.data);
              checkDifference()
          })
          .catch(error => {
              console.error('Error making local HTTP request:', error.response ? error.response.data : error.message);
          });
        } else {
          axios({
            method: 'post',
            url: endpointUrl, 
            data: requestBody,
            headers: {'Authorization': `Bearer ${bearerToken}`},
            // timeout: 240000
          })
          .then(response => {
              // Write response body to JSON file
              writeJSONToFile(responseBodyFilePath, response.data);
              checkDifference()
          })
          .catch(error => {
              console.error('Error making HTTP request:', error.response ? error.response.data : error.message);
          });
        }
    })
    .catch(error => {
        console.error('Error making HTTP request:', error.response ? error.response.data : error.message);
    });

// Function to read JSON file
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading JSON file:', err);
        return null;
    }
}

// Function to write JSON to a file
function writeJSONToFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log('JSON data written to file:', filePath);
    } catch (err) {
        console.error('Error writing JSON to file:', err);
    }
}

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

// Path to request body JSON file
const requestBodyFilePath = `./test_cases/${test_case}/nxgen_input.json`;

// Path to response body JSON file
const responseBodyFilePath = `./test_cases/${test_case}/nxgen_output.json`;

// Read request body from JSON file
const requestBody = readJSONFile(requestBodyFilePath);

if (!requestBody) {
    console.error('Error reading request body JSON file. Exiting...');
    process.exit(1);
}

const columns = {
  "lineNum": 1,
  "locationCode": 2,
  "locationNum": 3,
  "frequencyLow": 4,
  "frequencyHigh": 5,
  "stationClassCode": 7,
  "emissionDesignator": 8,
  "coordinationCode": 13,
  "limitationMessages": 14
}

function checkDifference() {
  let buildKey = (lineNum, locationCode, locationNum, frequencyLow, frequencyHigh, stationClassCode, emissionDesignator, coordinationCode) => {
    return `${locationCode}|${locationNum}|${frequencyLow}|${frequencyHigh}|${stationClassCode}|${emissionDesignator}|${coordinationCode}`;
  }
  
  fs.readFile(`./test_cases/${test_case}/legacy_results.csv`, 'utf8', (err, data) => {
    let legacyData = {
      
    }
    let nxgenData = {}
  
    let difference = {}
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
  
    parser.parse(data, {
      delimiter: ',',
      relax_column_count: true // Allow varying number of columns per row
    }, (err, rows) => {
      if (err) {
        console.error('Error parsing CSV:', err);
        return;
      }
  
      // Print each row to the console
      rows.forEach(row => {
        let key = buildKey(
          row[columns.lineNum],
          row[columns.locationCode],
          row[columns.locationNum],
          row[columns.frequencyLow].toString(),
          row[columns.frequencyHigh] == "0" ? row[columns.frequencyLow].toString() : row[columns.frequencyHigh].toString(),
          row[columns.stationClassCode].toString(),
          row[columns.emissionDesignator].toString(),
          row[columns.coordinationCode]
        )
        
        legacyData[key.toString()] = {
          "limitationMessages": row[columns.limitationMessages].toString().replace("\r", "").replace("\"", "").replace("  ", " "),
        };
      });
    });
    fs.readFile(`./test_cases/${test_case}/nxgen_output.json`, 'utf8', (err, content) => {
      let nxgenJson = JSON.parse(content);
      nxgenJson.results.forEach(result => {
        // console.log(result);
        let key = buildKey(
          result.lineNum,
          result.locationCode,
          result.locationNum,
          result.frequencyLow,
          result.frequencyHigh,
          result.stationClassCode,
          result.emissionDesignator,
          result.coordinationCode
        )
  
        nxgenData[key.toString()] = {
          "limitationMessages": result.limitationMessages.join("|")
            //.replace("|Rule 30: Emissions may not exceed 11k.", "")
            .replace("signaling", "signaling"),
        }
      });
  
      for(let key in nxgenData) {
        difference[key] = {
          "nxgen": nxgenData[key].limitationMessages,
        };
      }
  
      for(let key in legacyData) {
        difference[key] = {
          ...difference[key],
          "legacy": legacyData[key].limitationMessages,
        }
      }
  
      for(let key in difference) {
        if(difference[key].nxgen != null && difference[key].legacy != null && difference[key].nxgen.toString() == difference[key].legacy.toString()) {
          delete difference[key]
        }
      }
  
      differences_path = `./test_cases/${test_case}/differences_${environment}.json` 
      fs.writeFile(differences_path, JSON.stringify(difference, null, 2), err => {
        // Checking for errors 
        if (err) throw err;
        console.log(`Done writing. Results are in ${differences_path}`);
      });
    });
  }); 
}