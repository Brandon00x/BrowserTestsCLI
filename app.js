#!/usr/bin/env node
const { logger } = require("./Logger/logger");
const { getUserParams } = require("./parameters/setParameters");
const { toggleVPN } = require("./vpn/vpn");
const { directoryExists } = require("./node/directoryExists");
const { browser } = require("./browser/browser");
const { writeToFile } = require("./node/writeFile");
const process = require("process");
const { osCmd } = require("./node/osCmd");
const attempts = [];

async function startApp() {
  const parameters = await getUserParams();
  const updateLogger = setInterval(() => {
    logger(parameters); // STDOUT Progress
  }, 10);

  await directoryExists(parameters.link, "link", parameters); // Set Link File or Single
  await directoryExists(parameters.selector, "selector", parameters); // Set Selector File or Single
  await directoryExists(parameters.action, "actions", parameters); // Set Action File Or Single

  for (let i = 0; i < parameters.links.length; i++) {
    parameters.attempts = 1;
    do {
      parameters.success = false; // Boolean Prevents Skipping Link
      parameters.index = i + 1; // Index of Link
      parameters.selectorIndex = 0; // Index of Click Selector
      parameters.selector = "";
      parameters.link = parameters.links[i]; // Link To Search
      parameters.vpn
        ? (parameters.ip = await toggleVPN(parameters))
        : (parameters.ip = await osCmd("curl ifconfig.me")); // Connect VPN / Returns IP

      const result = await browser(parameters, updateLogger); // Download File.

      // Error Downloading File
      if (!result.success) {
        parameters.attempts++; // Increase Attempts
        parameters.error = result.error; // Set Error to Be Logged
        parameters.status = parameters.error;
        attempts.push({ success: false, parameters });

        // User Defined Max Attempt Limit Reached
        if (parameters.attempts > parameters.maxAttempts) {
          parameters.status = "Reached Max Attempts.";
          parameters.success = true;
        }
      }
      // File Download Success
      else if (result.success) {
        parameters.status = `Download Complete`;
        attempts.push({ success: true, parameters });
        parameters.success = true; // File Downloaded
      }
    } while (parameters.success === false);
  }

  return new Promise((resolve) => {
    // Cleanup Console
    parameters.selector = "";
    // Exit Program With Success
    setTimeout(async () => {
      clearInterval(updateLogger);
      await writeToFile(parameters); // Record Failure.
      process.exitCode = 0;
      console.log(`\x1b[32m${"Exit Code:"}\x1b[0m ${process.exitCode}`);
      resolve(process.exit());
    }, 1000);
  });
}

startApp();
