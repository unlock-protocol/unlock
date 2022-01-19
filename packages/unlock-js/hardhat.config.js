/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers')

const { subtask, task } = require('hardhat/config')
const { HARDHAT_NETWORK_NAME } = require('hardhat/plugins')
const { runCLI } = require('jest')
const process = require('process')
const jestConfig = require('./jest.config')

const TASK_JEST = 'test:jest'
const TASK_JEST_RUN_TESTS = 'jest:run'

subtask(TASK_JEST_RUN_TESTS).setAction(async () => {
  const testFailures = await new Promise((resolve, reject) => {
    return runCLI(jestConfig, [process.cwd()])
      .then((result) => resolve(result))
      .catch((error) => reject(error))
  })

  return testFailures.results
})

task(TASK_JEST, 'Runs jest tests').setAction(
  async ({ watch }, { run, network }) => {
    const testResults = await run(TASK_JEST_RUN_TESTS, { watch })

    if (network.name === HARDHAT_NETWORK_NAME) {
      const stackTracesFailures = await network.provider.send(
        'hardhat_getStackTraceFailuresCount'
      )

      if (stackTracesFailures !== 0) {
        console.warn(
          `Failed to generate ${stackTracesFailures} stack trace(s). Run Hardhat with --verbose to learn more.`
        )
      }
    }
    const exit = testResults.success ? 0 : 1
    process.exit(exit)
  }
)
module.exports = {
  solidity: '0.8.0',
}
