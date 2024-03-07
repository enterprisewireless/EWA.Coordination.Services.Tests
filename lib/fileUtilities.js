const fs = require("fs");
const path = require("path");

module.exports = {
  readJSONFile: function (filePath) {
    try {
      const data = fs.readFileSync(filePath);
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading JSON file:", err);
      return null;
    }
  },
  writeJSONToFile: function (filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log("JSON data written to file:", filePath);
    } catch (err) {
      console.error("Error writing JSON to file:", err);
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
