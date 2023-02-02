async function setUserParams(params) {
  return new Promise(async (resolve, reject) => {
    //// Logging Parameters
    const parameters = {
      //// REQUIRED PARAMETERS
      // Link: Single Link or File Path
      link:
        typeof params.link === "undefined" || params.link.length <= 2
          ? reject("Link")
          : params.link,

      // Selector(s): Must Be Defined. Determines
      selector:
        typeof params.selector === "undefined" || params.selector.length <= 0
          ? reject("Link Selector")
          : params.selector,

      action: params.actionsPath, // Actions File Path

      //// Array of Items
      links: [], // Multiple Links (Read from File)
      selectors: [], // Multiple Selectors (Read from File)
      actions: [], // Multiple Actions (Read from File)

      // User Defined Parameters
      timeout: params.timeout, // Int: Timeout Waiting for Selector
      maxAttempts: params.maxAttempts, // Int: Maximum Attempts Retrying Link
      hideBrowser: params.hideBrowser, // Boolean: Headless Browser
      vpn: params.vpn, // Boolean: Use VPN

      ////  Attempt Parameters
      index: 1, // Index of Link List
      selectorIndex: 0, // Index of Selector List
      attempts: 1, // Count of Attempts for Link Index
      totalLinks: 0, // Total Links
      totalSelectors: 0, // Total Selectors
      downloadTime: 0, // Total Download Time (Seconds)
      clickedLinks: [], // Text of Clicked Link(s)
      evaluatedLinks: [], // Text of Links Evaluated But Not Clicked.
      attemptedCaptchas: [], // OCR of Captchas
      currentCaptcha: "",
      ip: "N/A", // IP Address

      ////  Static Parameters
      pageWidth: 1080, // Int Page Width Pixels
      pageHeight: 1200, // Int Page Height Pixels

      //// Event Parameters
      status: "Loading", // Status of Program
      success: false, // Boolean (Triggers Next Link)
      error: false, // Error Message on Failure.
    };
    resolve(parameters);
  }).catch((err) => {
    const errmsg = `Missing required parameters.\nParameters Missing: ${err}`;
    throw errmsg;
  });
}

// User Defined or Default Parameters
async function getUserParams() {
  return new Promise((resolve, reject) => {
    const userFlags = {
      // Required
      link: "", // Link or Links File Path
      selector: "", // Selector or Selectors File Path
      actionsPath: "", // Action or Actions File Path
      // Optional
      vpn: false, // Use VPN
      hideBrowser: false, // Headless Browser
      timeout: 4000, // Selector Timeout
      maxAttempts: 100, // Max Attempts
    };

    let help;
    process.argv.forEach(function (val, index) {
      if (index > 1) {
        let isBoolorVal =
          val === "true" || val === "false" ? JSON.parse(val) : val; // Convert boolean string to boolean OR string
        userFlags[Object.keys(userFlags)[index - 2]] = isBoolorVal;
      }
      val === "help" ? (help = true) : null;
    });

    if (help) {
      helpMsg();
    } else {
      resolve(setUserParams(userFlags));
    }
  }).catch((err) => {
    return new Promise((resolve) => {
      console.log(err);
      process.exitCode = 0;
      resolve(process.exit());
    });
  });
}

async function helpMsg() {
  console.log(`---------HELP-----------`);

  console.log(`---REQUIRED ARGUEMENTS:`);
  console.log(`Link(s):     "URL or FILE Path"      (google.com) (links.txt)`);
  console.log(`Selector(s): "SELECTOR or FILE Path" (.btn) (selectors.txt)`);
  console.log(
    `Action(s):   "ACTION or FILE Path"   (click, evaluate, download captcha, inputCaptcha) (actions.txt)`
  );
  console.log(`------------------------`);
  console.log(`---OPTIONAL ARGUEMENTS:`);
  console.log(`VPN: boolean               (Default false)`);
  console.log(`Hide Browser: boolean.     (Default: false)`);
  console.log(`Timeout: number(ms)        (Default 4000)`);
  console.log(`Max Attempts: number       (Default 100)`);
}

module.exports = { getUserParams };
