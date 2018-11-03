const Config = require('truffle-config')
const Contracts = require('truffle-workflow-compile')
const ganacheCli = require('ganache-cli')

const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const reactApp = require('../../unlock-app/src/_server')

const compileContracts = new Promise((resolve, reject) => {
  const config = Config.default()
  config.working_directory = `${__dirname}/../../smart-contracts/`

  Contracts.compile(config.with({
    all: true,
    quiet: true,
  }), (error, artifacts) => {
    if (error) {
      return reject(error)
    }
    return resolve(artifacts)
  })
})

const startGanache = new Promise((resolve, reject) => {
  const server = ganacheCli.server()
  server.listen(8545, (err, blockchain) => {
    if (err) {
      return reject(err)
    }
    return resolve([server, blockchain])
  })
})

module.exports = async () => {
  const [ganache, blockchain] = await startGanache

  const contracts = await compileContracts

  const [http, app] = await reactApp(3000, true)

  global.UNLOCK_INTEGRATION_TESTS = {
    http,
    app,
    ganache,
    blockchain,
  }

  await setupPuppeteer()
}
