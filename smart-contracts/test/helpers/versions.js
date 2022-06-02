const { config, run, ethers } = require('hardhat')
const path = require('path')
const fs = require('fs-extra')
const { TASK_COMPILE } = require('hardhat/builtin-tasks/task-names')

const { LATEST_UNLOCK_VERSION } = require('../helpers/constants')

// files path
const CONTRACTS_PATH = path.resolve(
  config.paths.root,
  'contracts',
  'past-versions'
)
const ARTIFACTS_PATH = path.resolve(
  config.paths.root,
  'artifacts',
  'past-versions'
)

function getUnlockVersionNumbers() {
  return (
    Array(LATEST_UNLOCK_VERSION)
      .fill(0)
      .map((_, i) => i)
      // skip the contracts before v6
      .filter((v) => v > 5)
  )
}

// returns the latest PublicLock version number corresponding to a version of Unlock
function getMatchingLockVersion(unlockVersion) {
  // before Unlock v10, unlock version equals lock version
  const publicLockVersions = getUnlockVersionNumbers().reduce(
    (acc, v) => ({
      ...acc,
      [v]: v,
    }),
    {}
  )
  // after v10, they start decoupling
  publicLockVersions[10] = 9
  publicLockVersions[11] = 10

  return publicLockVersions[unlockVersion]
}

async function getContractFactoryAtVersion(contractName, versionNumber) {
  // copy contract file
  await fs.copy(
    require.resolve(
      `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${versionNumber}.sol`
    ),
    path.resolve(CONTRACTS_PATH, `${contractName}V${versionNumber}.sol`)
  )

  // Recompile
  await run(TASK_COMPILE, { quiet: true })

  // return factory
  return await ethers.getContractFactory(
    `contracts/past-versions/${contractName}V${versionNumber}.sol:${contractName}`
  )
}

async function getContractAtVersion(
  contractName,
  versionNumber,
  contractAddress
) {
  return await ethers.getContractAt(
    `contracts/past-versions/${contractName}V${versionNumber}.sol:${contractName}`,
    contractAddress
  )
}

async function cleanupPastContracts() {
  await fs.remove(CONTRACTS_PATH)
  await fs.remove(ARTIFACTS_PATH)
}

module.exports = {
  getContractAtVersion,
  getUnlockVersionNumbers,
  getMatchingLockVersion,
  getContractFactoryAtVersion,
  cleanupPastContracts,
}
