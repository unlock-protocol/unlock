const { task } = require('hardhat/config')
const { getNetworkName } = require('../helpers/network')
const { getDeployment } = require('../helpers/deployments')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

task('upgrade', 'Upgrade a contract')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, { ethers, upgrades }) => {
    const { chainId } = await ethers.provider.getNetwork()
    const contractName = contract.replace('contracts/', '').replace('.sol', '')

    const networkName = process.env.RUN_MAINNET_FORK
      ? 'mainnet'
      : getNetworkName(chainId)

    // eslint-disable-next-line no-console
    console.log(`Deploying new implementation on ${networkName}...`)

    let contractInfo
    if (networkName === 'localhost') {
      contractInfo = await getDeployment(chainId, contractName)
    } else {
      ;[contractInfo] =
        OZ_SDK_EXPORT.networks[networkName].proxies[
          `unlock-protocol/${contractName}`
        ]
    }

    const { address } = contractInfo

    const Contract = await ethers.getContractFactory(contractName)
    const implementation = await upgrades.prepareUpgrade(address, Contract)

    // eslint-disable-next-line no-console
    console.log(`${contractName} implementation deployed at: ${implementation}`)
  })
