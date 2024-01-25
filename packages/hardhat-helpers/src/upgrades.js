const fs = require('fs-extra')
const path = require('path')

const getContractsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'contracts', 'past-versions')

const getArtifactsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'artifacts', 'contracts', 'past-versions')

const copyContractFiles = async (dirname, contractName, version) => {
  // need to copy .sol for older versions in contracts repo
  const pastUnlockPath = require.resolve(
    `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${version}.sol`
  )

  await fs.copy(
    pastUnlockPath,
    path.resolve(getContractsPath(dirname), `${contractName}V${version}.sol`)
  )
}

async function copyAndBuildContractsAtVersion(dirname, contracts) {
  const { ethers, run } = require('hardhat')

  // copy all files
  await Promise.all(
    contracts.map(({ contractName, version }) =>
      copyContractFiles(dirname, contractName, version)
    )
  )

  // re-compile contract
  await run('compile')

  // get factory using fully qualified path
  const qualifiedPaths = await Promise.all(
    contracts.map(
      ({ contractName, version, contractFullName }) =>
        `contracts/past-versions/${contractName}V${version}.sol:${
          contractFullName || contractName
        }`
    )
  )

  return qualifiedPaths
}

async function cleanupContractVersions(dirname) {
  // delete .sol file
  await fs.remove(getContractsPath(dirname))
  // dont delete artifacts
}

export default {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
}
