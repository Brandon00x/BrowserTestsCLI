// Executes Shell Commands and Returns Result Info.
const { exec } = require("child_process");

async function osCmd(cmd) {
  return new Promise(function (resolve) {
    let osCmd;
    let dataInfo = [];
    let dataErr = [];
    let errorResult = [];
    let cmdResult = {};

    osCmd = exec(cmd);
    // Execute Command

    osCmd.stdout.on("data", (data) => {
      if (data.length > 0) {
        dataInfo.push(data);
      }
    });

    osCmd.stderr.on("data", (data) => {
      if (data.length > 0) {
        dataErr.push(data.replace(/(\r\n|\n|\r)/gm, ""));
      }
    });

    osCmd.on("error", (err) => {
      if (err.length > 0) {
        errorResult.push({ error: err });
      }
    });

    osCmd.on("close", (code) => {
      let info = dataInfo;
      let errInfo = dataErr;
      let error = errorResult;
      let exitCode = code;

      cmdResult = {
        info,
        errInfo,
        error,
        exitCode,
      };

      resolve(info);
    });
  });
}

module.exports = { osCmd };
