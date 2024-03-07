const axios = require("axios");
const https = require("https");

module.exports = {
  execute: async function (environment, bearerToken, endpointUrl, requestBody) {
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
    })
      .then((response) => {
        apiResponse = response;
      })
      .catch((error) => {
        console.error(
          `Error making HTTP request at ${endpointUrl}:`,
          error.response ? error.response.data : error.message
        );
      });

    return apiResponse;
  },
};
