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

      // make sure path are not ignored
      jestConfig.testPathIgnorePatterns =
        jestConfig.testPathIgnorePatterns.filter(
          (ign) => !files.some((f) => ign.endsWith(f))
        )
    }

    const testFailures = await new Promise((resolve, reject) => {
      return runCLI({ ...jestConfig, watch }, [process.cwd()])
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    })

    return testFailures.results
  }
)

const showTestFailures = async (network) => {
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
}

task(TASK_JEST_SINGLE, 'Runs jest integration tests separately')
  .addParam('file', 'the path of the file to test')
  .setAction(async ({ file }, { run, network }) => {
    const testResults = await run(TASK_JEST_RUN_TESTS, { files: [file] })
    showTestFailures(network)
    const exit = testResults.success ? 0 : 1
    process.exit(exit)
  })

task(TASK_JEST_SINGLE_INTEGRATION, 'Runs jest integration tests separately')
  .addPositionalParam('file', 'the path of the file to test')
  .addOptionalParam('lockVersion', 'the version of the PublicLock contract')
  .addOptionalParam('unlockVersion', 'the version of the Unlock contract')
  .setAction(
    async (
      { file, lockVersion = 12, unlockVersion = 12 },
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
      showTestFailures(network)
      const exit = testResults.success ? 0 : 1
      process.exit(exit)
    }
  )

task(TASK_JEST, 'Runs jest tests')
  // .setOptionalFlag('watch', 'Watch if test changes')
  .setAction(async ({ watch }, { run, network }) => {
    const testResults = await run(TASK_JEST_RUN_TESTS, { watch })
    showTestFailures(network)
    const exit = testResults.success ? 0 : 1
    process.exit(exit)
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
