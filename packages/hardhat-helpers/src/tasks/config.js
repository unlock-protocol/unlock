const { task } = require('hardhat/config')

const initializeConfigTask = () =>
  task('config', 'Show current config')
    .addFlag('json', 'output as JSON')
    .setAction(({ json }, { config }) => {
      console.log(json ? JSON.stringify(config) : config)
    })

const initialize = () => {
  initializeConfigTask()
}

module.exports = initialize
