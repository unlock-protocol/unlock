var fs = require('fs');
var Config = require("truffle-config");
var Contracts = require("truffle-workflow-compile");

const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const reactApp = require('../../unlock-app/src/_server')

const compileContracts = new Promise((resolve, reject) => {
  var config = Config.default();
  config.working_directory = `${__dirname}/../../smart-contracts/`

  Contracts.compile(config.with({
    all: true,
    quiet: true
  }), (error, artifacts) => {
    if(error) {
      return reject(error)
    }
    return resolve(artifacts)
  })
})

module.exports = async () => {

  const contracts = await compileContracts

  const [http, app] = await reactApp(3000, true)

  global.UNLOCK_INTEGRATION_TESTS = {
    http,
    app
  }

  await setupPuppeteer()
}

