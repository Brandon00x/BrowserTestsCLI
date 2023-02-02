const fs = require("fs");
const readline = require("readline");

async function processLineByLine(path, type, parameters) {
  return new Promise(async (resolve, reject) => {
    const fileStream = fs.createReadStream(path);
    const lines = [];

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      parameters.status = `Reading File: ${path}. Line: ${line}`;
      if (type === "link") {
        parameters.links.push(line);
      } else if (type === "selector") {
        parameters.selectors.push(line);
      } else if (type === "actions") {
        parameters.actions.push(line);
      }
    }
    parameters.status = `Finished Processing ${type} File: ${path}`;
    resolve(lines);
  });
}

module.exports = { processLineByLine };
