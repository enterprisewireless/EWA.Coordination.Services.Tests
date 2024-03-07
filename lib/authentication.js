const axios = require("axios");
const dotenv = require('dotenv');
const path = require('path');

module.exports = {
  getAuthorizationFormData: function(environment) {
    dotenv.config({
      path: path.resolve(__dirname, `${environment}.env`)
    });

    return {
      grant_type: 'client_credentials',
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID,
      scope: process.env.SCOPE
    };
  },
  getBearerToken: async function getBearerToken(
    tenantId,
    authorizationFormData
  ) {
    let bearerToken = "";
    await axios({
      method: "post",
      url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      data: authorizationFormData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((response) => {
        bearerToken = response.data.access_token;
      })
      .catch((error) => {
        console.error(
          "Error getting bearer token:",
          error.response ? error.response.data : error.message
        );
      });

    return bearerToken;
  },
};
