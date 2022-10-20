/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers')

const { subtask, task } = require('hardhat/config')
const { HARDHAT_NETWORK_NAME } = require('hardhat/plugins')
const { runCLI } = require('jest')
const process = require('process')
const jestConfig = require('./jest.config')

const TASK_JEST_SINGLE = 'test:single'
const TASK_JEST_SINGLE_INTEGRATION = 'test:integration'
const TASK_JEST = 'test:jest'
const TASK_JEST_RUN_TESTS = 'jest:run'

subtask(TASK_JEST_RUN_TESTS).setAction(
  async ({ watch = false, files = [] }) => {
    if (files.length) {
      jestConfig.testMatch = files.map((it) =>
        it.endsWith('.js') || it.endsWith('*') ? `**/${it}**` : `${it}\\.js$`
      )
    }
    const projects = [process.cwd()]

    const testFailures = await new Promise((resolve, reject) => {
      return runCLI({ ...jestConfig, watch }, projects)
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    })

    return testFailures.results
  }
)

const showTestResults = async (network, testResults) => {
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

task(TASK_JEST_SINGLE, 'Runs jest integration tests separately')
  .addParam('file', 'the path of the file to test')
  .setAction(async ({ file }, { run, network }) => {
    const testResults = await run(TASK_JEST_RUN_TESTS, { files: [file] })
    showTestResults(network, testResults)
  })

task(TASK_JEST_SINGLE_INTEGRATION, 'Runs jest integration tests separately')
  .addPositionalParam('file', 'the path of the file to test')
  .addOptionalParam('lockVersion', 'the version of the PublicLock contract')
  .addOptionalParam('unlockVersion', 'the version of the Unlock contract')
  .setAction(
    async (
      { file, lockVersion = 11, unlockVersion = 11 },
      { run, network }
    ) => {
      // pass args to jest test runner using env vars
      process.env.UNLOCK_JS_JEST_RUN_UNLOCK_VERSION = `v${unlockVersion}`
      process.env.UNLOCK_JS_JEST_RUN_PUBLIC_LOCK_VERSION = `v${lockVersion}`
      process.env.UNLOCK_JS_JEST_RUN_TEST_PATH = file.replace(
        'src/__tests__/integration',
        '.'
      )

      const testResults = await run(TASK_JEST_RUN_TESTS, {
        files: ['src/__tests__/integration/single.js'], // single test runner
      })
      showTestResults(network, testResults)
    }
  )

task(TASK_JEST, 'Runs jest tests')
  // .setOptionalFlag('watch', 'Watch if test changes')
  .setAction(async ({ watch }, { run, network }) => {
    const testResults = await run(TASK_JEST_RUN_TESTS, { watch })
    showTestResults(network, testResults)
  })

module.exports = {
  solidity: {
    version: '0.8.13',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
    },
  },
}
