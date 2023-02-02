const { osCmd } = require("../node/osCmd");

// Disconnect Then Reconnect VPN
async function toggleVPN(parameters) {
  await disconnectVPN(parameters);
  await osCmd("mullvad connect"); // Connect VPN
  parameters.status = `VPN Connecting`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      let isConnected = await checkVPN("Connected"); // Boolean Connected(true) || Disconnect(false)
      if (isConnected) {
        parameters.status = "VPN Connected";
        resolve(getIp()); // VPN Connected Resolve IP.
      } else {
        toggleVPN(parameters); // Failed to Connect VPN, Recursively Retry.
      }
    }, 4000);
  });
}

// Disconnect VPN
async function disconnectVPN(parameters) {
  await osCmd("mullvad disconnect"); // Disconnect
  parameters.ip = "\x1b[31mDisconnected\x1b[0m";
  parameters.status = "VPN Disconnected";

  return new Promise((resolve) => {
    setTimeout(async () => {
      let isDisconnected = await checkVPN("Disconnected"); // Boolean Connected(true) || Disconnect(false)
      if (isDisconnected) {
        resolve(true); // VPN Connected Resolve IP.
      } else {
        disconnectVPN(parameters);
      }
    }, 1000);
  });
}

// VPN Connection Status Boolean
async function checkVPN(statusString) {
  let status = await osCmd("mullvad status");
  let connected = status.toString().includes(statusString) ? true : false;
  return connected;
}

// VPN IP Address String
async function getIp() {
  let statusVerbose = await osCmd("mullvad status -v");
  let vpnString = statusVerbose.toString();
  let ip = vpnString.slice(
    vpnString.indexOf("(") + 1,
    vpnString.indexOf(")") - 10
  );
  return ip;
}

module.exports = { toggleVPN };
