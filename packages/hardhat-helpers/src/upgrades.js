const fs = require('fs-extra')
const path = require('path')

const getContractsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'contracts', 'past-versions')

const getArtifactsPath = (dirname) =>
  path.resolve(dirname, '..', '..', 'artifacts', 'contracts', 'past-versions')

const copyContractFiles = async ({
  dirname,
  contractName,
  version,
  subfolder,
}) => {
  let fullPath
  if (version) {
    fullPath = `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${version}.sol`
  } else {
    fullPath = `@unlock-protocol/contracts/dist/${subfolder}/${contractName}.sol`
  }

  // need to copy .sol for older versions in contracts repo
  const requiredPath = require.resolve(fullPath)

  const destContractName = version
    ? `${contractName}V${version}.sol`
    : `${contractName}.sol`

  const destPath = path.resolve(getContractsPath(dirname), destContractName)
  await fs.copy(requiredPath, destPath)

  return destContractName
}

async function copyAndBuildContractsAtVersion(dirname, contracts) {
  const { ethers, run, network } = require('hardhat')

  // copy all files
  const destContractNames = await Promise.all(
    contracts.map(({ contractName, version, subfolder }) =>
      copyContractFiles({ dirname, contractName, version, subfolder })
    )
  )

  // re-compile contract (and checking if zksync)
  const { zksync, ethNetwork } = network.config
  const compileArgs = zksync
    ? { network: ethNetwork === 'mainnet' ? 'zksync' : 'zksyncSepolia' }
    : {}
  await run('compile', compileArgs)

  // get factory using fully qualified path
  const qualifiedPaths = await Promise.all(
    contracts.map(
      ({ contractName, contractFullName }, i) =>
        `contracts/past-versions/${destContractNames[i]}:${
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
