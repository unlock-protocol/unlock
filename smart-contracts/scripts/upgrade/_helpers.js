const { ethers, run } = require('hardhat')
const fs = require('fs-extra')
const path = require('path')

const contractsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'contracts',
  'past-versions'
)

const artifactsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

async function copyAndBuildContractAtVersion(contractName, version) {
  // need to copy .sol for older versions in contracts repo
    const pastUnlockPath = require.resolve(
      `@unlock-protocol/contracts/dist/Unlock/${contractName}V${version}.sol`
    )
    await fs.copy(
      pastUnlockPath,
      path.resolve(contractsPath, `${contractName}V${version}.sol`)
    )

    // re-compile contract
    await run('compile')

    // get factory using fully qualified path
    const Contract = await ethers.getContractFactory(
      `contracts/past-versions/${contractName}V${version}.sol:${contractName}`
    )
    return Contract
}

async function cleanupContractVersions() {
    // delete .sol file
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)

}

module.exports = {
  copyAndBuildContractAtVersion,
  cleanupContractVersions
}