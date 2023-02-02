const { appendFile } = require("node:fs");

// Logging || Append Result to File
async function writeToFile(parameters) {
  return new Promise(async (resolve) => {
    // TODO: Better Logging
    appendFile(
      `${process.cwd()}/btlogs.json`,
      JSON.stringify(parameters),
      (err) => {
        if (err) throw err;
        resolve(true);
      }
    );
  });
}

module.exports = { writeToFile };
