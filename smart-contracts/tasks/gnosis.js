const { task } = require('hardhat/config')

task('gnosis:create', 'Create a Gnosis safe from a list of owners')
  .addVariadicPositionalParam('owners', 'addresses of the owners')
  .addOptionalParam('threshold', 'threshold for majority vote', '1')
  .addFlag('clone', 'use addresses from Unlock mainnet wallet', '1')
  .setAction(async ({ owners, threshold, clone }) => {
    // eslint-disable-next-line global-require
    const gnosisDeployer = require('../scripts/multisig/create')
    return await gnosisDeployer({ owners, threshold, clone })
  })

task('gnosis:address', 'Get the address of a safe')
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

task('gnosis:owners', 'List owners of a safe')
  .addOptionalParam('safeAddress', 'the address of the multisig contract')
  .addOptionalParam(
    'chainId',
    'the id of the chain to fetch from (default to hardhat provider)'
  )
  .setAction(async ({ safeAddress, chainId }) => {
    // eslint-disable-next-line global-require
    const gnosisOwners = require('../scripts/multisig/owners')
    const owners = await gnosisOwners({ safeAddress, chainId })
    // log the results
    owners.forEach((owner) => console.log(`${owner}`))
  })
