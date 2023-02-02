const axios = require("axios");
const { osCmd } = require("../node/osCmd");
const fs = require("fs");
const fileName = `${__dirname}/captcha.png`;

// Solve Captcha with ImageMagik and Tesseract OCR TODO: Params
async function solveCaptcha(
  length,
  crop,
  resize,
  removePxs,
  onlyNums,
  onlyCaps
) {
  let solveCaptcha;

  if (crop) {
    // Crop Captcha Image. TODO: Crop PXs
    await osCmd(
      `convert ${fileName} -gravity Center -crop 40x20+0+0 +repage ${fileName}`
    );
  }

  if (resize) {
    // Resize Captcha Image TODO: Resize %
    await osCmd(`convert ${fileName} -resize 600% ${fileName}`);
  }

  if (removePxs) {
    // Remove Extra Pixles TODO:
    await osCmd(
      `convert ${fileName} -gaussian-blur 0 -threshold 40% -paint 1 ${fileName}`
    );
  }

  //// OCR CAPTCHA IMAGE.
  if (onlyNums) {
    // Only Digits
    solveCaptcha = await osCmd(
      `tesseract ${fileName} stdout -c tessedit_char_whitelist=0123456789 --psm 7`
    );
  } else if (onlyCaps) {
    // Capital Letters + Numbers
    solveCaptcha = await osCmd(
      `tesseract ${fileName} stdout -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 --psm 7`
    );
  } else {
    // Any Characters
    solveCaptcha = await osCmd(`tesseract ${fileName} stdout --psm 7`);
  }

  return new Promise(async (resolve, reject) => {
    const captchaValue = solveCaptcha.toString().trim();
    if (captchaValue.length !== length) {
      // const error = `Captcha Length ${captchaValue.length} was not expected. Expected ${length}. Value ${captchaValue}`;
      reject(captchaValue); // Captcha Length Not Expected
    } else {
      resolve(captchaValue); //Resolve Captcha
    }
  }).catch((err) => {
    return err; //TODO: Better Error Handling Current Error = Captcha Value Incorrect Length.
  });
}

// Downloads Captcha Image.
async function downloadCaptchaImg(url) {
  return axios({
    url,
    method: "GET",
    responseType: "stream",
  }).then((response) => {
    return new Promise(async (resolve) => {
      response.data
        .pipe(fs.createWriteStream(fileName))
        .on("error", (err) => {
          throw err;
        })
        .once("close", () => {
          resolve(true);
        });
    });
  });
}

module.exports = { solveCaptcha, downloadCaptchaImg };
