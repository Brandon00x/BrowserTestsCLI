const fs = require("fs");
const { processLineByLine } = require("./readTextFile");
const URL = require("url").URL;

async function directoryExists(path, type, parameters) {
  return new Promise((resolve) => {
    fs.access(path, async function (error) {
      if (error) {
        // File Does Not Exist
        if (type === "link") {
          const isUrl = stringIsAValidUrl(parameters.link); // Check is Valid URL
          if (isUrl) {
            parameters.links.push(parameters.link); // Push Single Link
            parameters.status = `Using Single Link: ${parameters.links}`; // Log Single Link
            parameters.totalLinks = 1; // Set Total Links 1
            resolve();
          } else {
            throw new Error(`Invalid URL: ${parameters.link}`);
          }
        } else if (type === "selector") {
          if (parameters.selector.includes(".txt")) {
            throw new Error(
              `Unable to find selector file: ${parameters.selector}`
            );
          } else {
            parameters.selectors.push(parameters.selector); // Push Single Selector
            parameters.status = `Using Single Selector: ${parameters.selectors}`; // Set Single Selector
            parameters.totalSelectors = 1; // Set Total Selectors
            resolve(); // Using Single Selector
          }
        } else if (type === "actions") {
          if (parameters.action.includes(".txt")) {
            throw new Error(
              `Unable to find action file: ${parameters.actions}`
            );
          } else {
            parameters.status = `Using Single Action: ${parameters.action}`;
            parameters.totalActions = 1; // Set Total Actions
            resolve(); // Using Single Action
          }
        }
      } else {
        // MULTIPLE CONDITIONS
        parameters.status = `Found ${type} File: ${path}`;
        if (type === "link") {
          parameters.link = await processLineByLine(path, type, parameters); // Push Links to Parameters links Array
          parameters.totalLinks = parameters.links.length; // Set Total Links
          resolve("Link File");
        } else if (type === "selector") {
          parameters.link = await processLineByLine(path, type, parameters); // Push Links to Parameters links Array
          parameters.totalSelectors = parameters.selectors.length; // Set Total Links
          resolve("Selector File");
        } else if (type === "actions") {
          parameters.action = await processLineByLine(path, type, parameters); // Push Links to Parameters links Array
          resolve("Action Selector");
        }
      }
    });
  });
}

const stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = { directoryExists };
