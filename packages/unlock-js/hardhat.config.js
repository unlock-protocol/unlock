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
const TASK_JEST_SINGLE_INTEGRATION = 'test:single:integration'
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
  .addVariadicPositionalParam('files', 'the path of the file to test')
  .addOptionalParam('lockVersion', 'the version of the PublicLock contract')
  .addOptionalParam('unlockVersion', 'the version of the Unlock contract')
  .setAction(
    async ({ files, lockVersion, unlockVersion }, { run, network }) => {
      console.log(files, lockVersion, unlockVersion)
      const testResults = await run(TASK_JEST_RUN_TESTS, { projects: files })
      showTestResults(network, testResults)
    }
  )

task(TASK_JEST, 'Runs jest tests')
  // .setOptionalFlag('watch', 'Watch if test changes')
  .setAction(async ({ watch }, { run, network }) => {
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
