const axios = require("axios");
const https = require("https");
const chalk = require('chalk');

module.exports = {
  get_endpoint_url: function (environment) {
    switch(environment) {
      case "local":
        return 'https://localhost:7200/v1/Fcc601Application/External';
      case "develop":
        return 'https://coordination.azure-api.net/validate/v1/Fcc601Application/External?=';
      case "release":
        return 'https://coordinationservicesrelease.azure-api.net/validate/v1/Fcc601Application/External?=';
    }
  },
  execute: async function (environment, bearerToken, endpointUrl, requestBody, pathToTestCase) {
    let apiResponse = "";

    let httpsAgent = null;
    if (environment == "local") {
      httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    await axios({
      method: "post",
      url: endpointUrl,
      data: requestBody,
      headers: { Authorization: `Bearer ${bearerToken}` },
      httpsAgent: httpsAgent ?? null,
      timeout: 60000000,
    })
      .then((response) => {
        apiResponse = response;
      })
      .catch((error) => {
        console.error(chalk.red(
          `Error making HTTP request at ${endpointUrl} for ${pathToTestCase}:`,
          error.response ? error.response.data : error.message
        ));
      });

    return apiResponse;
  },
};
