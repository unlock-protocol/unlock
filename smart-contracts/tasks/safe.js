const { task } = require('hardhat/config')

task('safe:create', 'Create a Safe from a list of owners')
  .addOptionalVariadicPositionalParam('owners', 'addresses of the owners')
  .addOptionalParam('threshold', 'threshold for majority vote', '1')
  .setAction(async ({ owners, threshold }) => {
    // eslint-disable-next-line global-require
    const safeDeployer = require('../scripts/multisig/create')
    return await safeDeployer({ owners, threshold })
  })

task('safe:transfer', 'transfer the contract ownership to a multisig')
  .addParam('contractAddress', 'the address of the ownable contract')
  .addOptionalParam('safeAddress', 'the address of the multisig contract')
  .setAction(async ({ safeAddress, contractAddress }) => {
    const transferOwnership = require('../scripts/multisig/transferOwnership')
    await transferOwnership({ safeAddress, contractAddress })
  })

task('safe:address', 'Get the address of a safe')
  .addOptionalParam(
    'chainId',
    'the id of the chain to fetch from (default to hardhat provider)'
  )
  .setAction(async ({ chainId }) => {
    // eslint-disable-next-line global-require
    const getSafeAddress = require('../scripts/multisig/existing')
    const safeAddress = await getSafeAddress({ chainId })
    // log the results
    console.log(`safe on network ${chainId} : ${safeAddress}`)
  })

task('safe:version', 'Get the address of a safe').setAction(
  async (_, { ethers }) => {
    const {
      getSafeVersion,
      getSafeAddress,
    } = require('../scripts/multisig/_helpers')
    const { chainId } = await ethers.provider.getNetwork()
    const safeAddress = await getSafeAddress(chainId)
    const safeVersion = await getSafeVersion(safeAddress)
    // log the results
    console.log(`safe on network ${chainId} : ${safeAddress} (${safeVersion})`)
  }
)

task('safe:owners', 'List owners of a safe')
  .addOptionalParam('safeAddress', 'the address of the multisig contract')
  .addOptionalParam(
    'chainId',
    'the id of the chain to fetch from (default to hardhat provider)'
  )
  .setAction(async ({ safeAddress, chainId }) => {
    // eslint-disable-next-line global-require
    const safeOwners = require('../scripts/multisig/owners')
    const owners = await safeOwners({ safeAddress, chainId })
    // log the results
    owners.forEach((owner) => console.log(`${owner}`))
  })
