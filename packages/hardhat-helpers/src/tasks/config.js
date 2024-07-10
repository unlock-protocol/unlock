const { task } = require('hardhat/config')

const initializeConfigTask = () =>
  task('config', 'Show current config')
    .addFlag('json', 'output as JSON')
    .setAction(({ json }, { config }) => {
      // eslint-disable-next-line no-console
      console.log(json ? JSON.stringify(config) : config)
    })

const initialize = () => {
  initializeConfigTask()
}

module.exports = initialize
