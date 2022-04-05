/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers')
require('@openzeppelin/hardhat-upgrades')

const fs = require('fs-extra')
const { subtask, task } = require('hardhat/config')
const { HARDHAT_NETWORK_NAME } = require('hardhat/plugins')
const { runCLI } = require('jest')
const process = require('process')
const path = require('path')
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
    // copy Unlock contracts to be used by OZ upgrades
    ;['UnlockV10', 'UnlockV11'].forEach(async (unlockName) => {
      // copy contract source over
      await fs.copy(
        require.resolve(
          `@unlock-protocol/contracts/dist/Unlock/${unlockName}.sol`
        ),
        path.resolve(`./src/__tests__/contracts/${unlockName}.sol`)
      )
    })

    // pre-compile contracts
    await run('compile')

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
  solidity: {
    version: '0.8.7',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
    },
  },
  paths: {
    sources: './src/__tests__/contracts',
    artifacts: './src/__tests__/artifacts',
  },
}
