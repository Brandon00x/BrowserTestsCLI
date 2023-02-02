const fs = require("fs");
const os = require("os");
const puppeteer = require("puppeteer");
const {
  solveCaptcha,
  downloadCaptchaImg,
} = require("../captchas/captchaSolver");
const downloadPath = `${os.homedir()}/Downloads`; // OS Download Folder

browser = async (parameters, updateLogger) => {
  return new Promise((resolve, reject) => {
    (async () => {
      ///////////////////////////////////
      //// Start and Configure Browser
      const browser = await puppeteer.launch({
        headless: parameters.hideBrowser, // Headless Browser
      });

      const page = await browser.newPage();
      await page.goto(parameters.link); // Goto Link
      await page.setViewport({
        width: parameters.pageWidth,
        height: parameters.pageHeight,
      }); // Configure Page Window Size.
      parameters.status = "Loaded Browser";

      ///////////////////////////////////
      //// Handle Selectors.
      for (let i = 0; i < parameters.selectors.length; i++) {
        parameters.action = parameters.actions[i];
        parameters.selector = parameters.selectors[i];
        parameters.selectorIndex++;

        // Handle Selector Actions (click, evaluate, captcha, download) TODO:
        await handleSelector(browser, page, parameters).catch((err) => {
          // TODO: Error Handling
        });
      }

      ///////////////////////////////////
      //// Finished
      browser.close();
      resolve({ success: true });
    })(parameters).catch((err) => {
      parameters.status = err.message;
      resolve({ success: false, error: err.message });
    });
  });
};

async function handleSelector(browser, page, parameters) {
  const linkTag = await page
    .waitForSelector(parameters.selector, {
      timeout: parameters.timeout, // Timeout waiting for Selector
    })
    .catch(() => {
      browser.close(); // TODO: Error Handling
      throw new Error(`Selector ${parameters.selector} was not present..`);
    });

  const linkText = await linkTag.evaluate((el) => el.textContent); // Evaluate Text of Link

  return new Promise(async (resolve, reject) => {
    if (parameters.action === "click") {
      //// Action Click Selector
      parameters.status = `Clicking Selector`;
      parameters.clickedLinks.push(linkText.trim());
      resolve(await page.click(parameters.selector)); // Click Link
    } else if (parameters.action === "evaluate") {
      //// Action Evaluate Selector Text
      parameters.status = `Evaluating Selector ${linkText}`;
      parameters.evaluatedLinks.push(linkText);
      resolve(true);
    } else if (parameters.action === "captcha") {
      //// Action: Solve Captcha
      parameters.status = `Solving Captcha`;
      const capImgUrl = await linkTag.evaluate((el) => el.src); // Evaluate Captcha Source.
      await downloadCaptchaImg(capImgUrl); // Download Captcha Image
      const capText = await solveCaptcha(4, false, false, false, false, true); // TODO: Captcha Params
      parameters.attemptedCaptchas.push(capText);
      parameters.currentCaptcha = capText;
      parameters.status = `Captcha Result ${capText}`;
      resolve(true);
    } else if (parameters.action === "inputCaptcha") {
      //// Action: Input Captcha
      parameters.status = `Input Captcha: ${parameters.currentCaptcha}`;
      await page.type(parameters.selector, parameters.currentCaptcha);
      resolve(true); // Input Captcha into Captcha_Code Element
    } else if (parameters.action === "download") {
      //// Action: Download
      parameters.clickedLinks.push(linkText);
      await page.click(parameters.selector);
      await downloadTimer(parameters); // Completes when .crdownload extension does not exist.
      resolve(true);
    }
  });
}

// Updates Download Time (seconds). Checks Every 5 Seconds for Completion.
async function downloadTimer(parameters) {
  return new Promise((resolve) => {
    let downloadSeconds = 0;
    const downloadTimer = setInterval(async () => {
      parameters.status = `Downloading... ${(downloadSeconds += 1)}s`;

      if (downloadSeconds % 5 === 0) {
        const complete = await checkDownloadStatus();

        if (complete) {
          clearInterval(downloadTimer);
          parameters.downloadTime = downloadSeconds;
          downloadSeconds = 0;
          resolve(true); // Check Download Status Every 5 Seconds.
        }
      }
    }, 1000);
  });
}

// Checks OS Downloads Directory for .crdownload file. Resolve if .crdownload does not exist.
async function checkDownloadStatus() {
  return new Promise((resolve) => {
    const extension = ".crdownload";
    const file = fs
      .readdirSync(downloadPath)
      .filter((fn) => fn.endsWith(extension)); // Files Has Extension

    if (file.length >= 1) {
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

//// TODO: Wait X Seconds for Download
// async function waitForDownload(time, parameters) {
//   let updateTime = time;
//   let consoleCountdown = setInterval(() => {
//     updateTime = updateTime - 1000;
//     parameters.status = `Queue Wait Time: ${updateTime / 1000} Seconds.`;
//   }, 1000);

//   return new Promise((resolve) => {
//     setTimeout(() => {
//       clearInterval(consoleCountdown);
//       resolve(true);
//     }, time);
//   });
// }

// TODO: Use Download Headers for %
// function showDownloadPercent(current, total) {
//   let downloadInterval = setInterval(() => {
//     process.stdout.write(`Downloading... ${current} | ${total}\r`);
//     if (current === total) clearInterval(downloadInterval);
//   }, 1000);
// }

module.exports = { browser };
