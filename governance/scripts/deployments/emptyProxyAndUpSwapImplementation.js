const { ethers, upgrades } = require('hardhat')

const {
  getNetwork,
  deployContract,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // 1. deploys a proxy contract with an empty implementation
  console.log(`Deploying proxy with empty impl...`)
  const [emptyQualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'EmptyImpl', subfolder: 'utils' },
  ])
  const EmptyImpl = await ethers.getContractFactory(emptyQualifiedPath)
  const { address: proxy } = await deployUpgradeableContract(EmptyImpl)

  // 2. transfer proxy admin ownership to DAO multisig
  const { multisig } = await getNetwork()
  await upgrades.admin.transferProxyAdminOwnership(proxy, multisig)

  // 2. deploys the UP swap implementation
  console.log(`Deploying UPSwap implementation...`)
  const [upSwapQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
  const { address: impl } = await deployContract(upSwapQualifiedPath)

  console.log(
    'Please submit a proposal to the DAO that would upgrade the proxy to the right implementation'
  )
  console.log({
    upSwapProxyAddress: proxy,
    upSwapImplAddress: impl,
  })
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
