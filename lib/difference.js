const fs = require("fs");
var parser = require('csv-parse');

module.exports = {
  checkDifference: function (legacyResultsPath, nxgenResultsPath, outputFilePath) {
    let buildKey = (
      lineNum,
      locationCode,
      locationNum,
      frequencyLow,
      frequencyHigh,
      stationClassCode,
      emissionDesignator,
      coordinationCode
    ) => {
      return `${locationCode}|${locationNum}|${frequencyLow}|${frequencyHigh}|${stationClassCode}|${emissionDesignator}|${coordinationCode}`;
    };

    fs.readFile(legacyResultsPath, "utf8", (err, data) => {
      let legacyData = {};
      let nxgenData = {};

      let difference = {};
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      parser.parse(
        data,
        {
          delimiter: ",",
          relax_column_count: true, // Allow varying number of columns per row
        },
        (err, rows) => {
          if (err) {
            console.error("Error parsing CSV:", err);
            return;
          }

          // Print each row to the console
          rows.forEach((row) => {
            let key = buildKey(
              row[columns.lineNum],
              row[columns.locationCode],
              row[columns.locationNum],
              row[columns.frequencyLow].toString(),
              row[columns.frequencyHigh] == "0"
                ? row[columns.frequencyLow].toString()
                : row[columns.frequencyHigh].toString(),
              row[columns.stationClassCode].toString(),
              row[columns.emissionDesignator].toString(),
              row[columns.coordinationCode]
            );

            legacyData[key.toString()] = {
              limitationMessages: row[columns.limitationMessages]
                .toString()
                .replace("\r", "")
                .replace('"', "")
                .replace("  ", " "),
            };
          });
        }
      );
      fs.readFile(nxgenResultsPath, "utf8", (err, content) => {
        let nxgenJson = JSON.parse(content);
        nxgenJson.results.forEach((result) => {
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
          );

          nxgenData[key.toString()] = {
            limitationMessages: result.limitationMessages
              .join("|")
              //.replace("|Rule 30: Emissions may not exceed 11k.", "")
              .replace("signaling", "signaling"),
          };
        });

        for (let key in nxgenData) {
          difference[key] = {
            nxgen: nxgenData[key].limitationMessages,
          };
        }

        for (let key in legacyData) {
          difference[key] = {
            ...difference[key],
            legacy: legacyData[key].limitationMessages,
          };
        }

        for (let key in difference) {
          if (
            difference[key].nxgen != null &&
            difference[key].legacy != null &&
            difference[key].nxgen.toString() ==
              difference[key].legacy.toString()
          ) {
            delete difference[key];
          }
        }

        fs.writeFile(
          outputFilePath,
          JSON.stringify(difference, null, 2),
          (err) => {
            // Checking for errors
            if (err) throw err;
            console.log(`Done writing. Results are in ${outputFilePath}`);
          }
        );
      });
    });
  },
};

const columns = {
  lineNum: 1,
  locationCode: 2,
  locationNum: 3,
  frequencyLow: 4,
  frequencyHigh: 5,
  stationClassCode: 7,
  emissionDesignator: 8,
  coordinationCode: 13,
  limitationMessages: 14,
};
