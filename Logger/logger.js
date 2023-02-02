function logger(parameters) {
  const row1 = `\x1b[32m${"Link:"}\x1b[0m ${parameters.index}/${
    parameters.totalLinks
  } \x1b[32m${"Selector:"}\x1b[0m ${parameters.selectorIndex}/${
    parameters.totalSelectors
  } \x1b[32m${"Attempt:"}\x1b[0m ${parameters.attempts}/${
    parameters.maxAttempts
  } \x1b[32m${"IP:"}\x1b[0m ${parameters.ip} \x1b[32m${"VPN:"} \x1b[0m${
    parameters.vpn
  }\n`;

  const row2 = `\x1b[32m${"Status:"}\x1b[0m ${parameters.status}.\n`;

  const row3 = `\x1b[32m${"Link:"}\x1b[0m ${parameters.link}\n`;

  let row4 = "";

  if (parameters.selector.length > 1) {
    row4 = `\x1b[32m${"Action:"}\x1b[0m ${
      parameters.action
    }. \x1b[32m${"Selector:"}\x1b[0m ${parameters.selector}`;
  }
  console.clear();
  process.stdout.write(`${row1}${row2}${row3}${row4}`);
}

module.exports = { logger };
