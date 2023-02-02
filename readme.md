# Browser Tests CLI

Browser Tests CLI is a Node command line application that is capable of performing automated tests on web pages and logging the results. Currently supported actions are click, evaluate, download, captcha.

## Installation

1. Install NodeJS
2. Install Depedencies: `npm i`
3. Use as CLI. `npm link`
4. View Help `browsertest help`

## Run Program / Examples

To run a default test: `npm run test` (downloads NodeJS installer to Downloads directory)

To choose a custom test or view examples open the tests folder and choose an example folder.
Or create your own links, selectors, and actions files and run them.
From that directory run:
`browsertest links.txt selectors.txt actions.txt`

Browser Tests CLI will create a file called btlog.json with results of command.
If you downloaded a file it is located in your downloads folder.
