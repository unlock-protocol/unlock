const fs = require('fs-extra')
const path = require('path')

const getContractsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'contracts', 'past-versions')

const getArtifactsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'artifacts', 'contracts', 'past-versions')

async function copyAndBuildContractAtVersion(dirname, contractName, version) {
  const { ethers, run } = require('hardhat')

  // need to copy .sol for older versions in contracts repo
  const pastUnlockPath = require.resolve(
    `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${version}.sol`
  )
  console.log({
    pastUnlockPath,
    newUnlk: path.resolve(
      getContractsPath(dirname),
      `${contractName}V${version}.sol`
    ),
  })
  await fs.copy(
    pastUnlockPath,
    path.resolve(getContractsPath(dirname), `${contractName}V${version}.sol`)
  )

  // re-compile contract
  await run('compile')

  // get factory using fully qualified path
  const Contract = await ethers.getContractFactory(
    `contracts/past-versions/${contractName}V${version}.sol:${contractName}`
  )
  return Contract
}

async function cleanupContractVersions(dirname) {
  // delete .sol file
  await fs.remove(getContractsPath(dirname))
  await fs.remove(getArtifactsPath(dirname))
}

export default {
  copyAndBuildContractAtVersion,
  cleanupContractVersions,
}
