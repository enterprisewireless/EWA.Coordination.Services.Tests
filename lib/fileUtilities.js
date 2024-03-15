const fs = require("fs");
const path = require("path");
const chalk = require('chalk');

module.exports = {
  getLegacyResultsFile: async function (pathToTestCase) {
    return new Promise((resolve, reject) => {
      fs.access(`${pathToTestCase}/legacy_results_adjusted.csv`, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(chalk.yellow(`No adjusted legacy results found for test case: ${pathToTestCase}. Using the original legacy results.`));
          resolve(`${pathToTestCase}/legacy_results.csv`);
        } else {
          console.log(chalk.green(`Using adjusted legacy results for test case: ${pathToTestCase}/legacy_results_adjusted.csv`));
          resolve(`${pathToTestCase}/legacy_results_adjusted.csv`);
        }
      });
    });
  },
  readJSONFile: function (filePath) {
    try {
      const data = fs.readFileSync(filePath);
      return JSON.parse(data);
    } catch (err) {
      console.error(chalk.red(`Error reading JSON file at ${filePath}:`, err));
      return null;
    }
  },
  writeJSONToFile: function (filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log("JSON data written to file:", filePath);
    } catch (err) {
      console.error(chalk.red(`Error writing JSON to ${filePath}: ${err}`));
    }
  },
  getDirectoryNames: function (directoryPath) {
    // Get an array of all items (files and directories) in the directory
    const items = fs.readdirSync(directoryPath, { withFileTypes: true });

    // Filter out only directories
    const folderNames = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    return folderNames;
  },
};
