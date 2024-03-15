const { task } = require('hardhat/config')
const { resolve } = require('path')

task('safe:create', 'Create a Safe from a list of owners')
  .addOptionalVariadicPositionalParam('owners', 'addresses of the owners')
  .addOptionalParam('threshold', 'threshold for majority vote', '1')
  .setAction(async ({ owners, threshold }) => {
    // eslint-disable-next-line global-require
    const safeDeployer = require('../scripts/multisig/create')
    return await safeDeployer({ owners, threshold })
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

task(
  'safe:bridge:execute',
  'Execute a call coming from the bridge to the Gnosis Zodiac Delay module'
)
  .addParam(
    'bridgeTx',
    'the tx emitted by the Connext bridge on the receiving chain'
  )
  .addOptionalParam(
    'delayMod',
    'The address of the Delay module on the receiving chain'
  )
  .setAction(async ({ bridgeTx, delayMod }) => {
    // eslint-disable-next-line global-require
    const crossExec = require('../scripts/multisig/crossExec')
    await crossExec({ bridgeTxHash: bridgeTx, delayModuleAddress: delayMod })
  })

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

task('safe:submit', 'Submit to multisig from a proposal file')
  .addParam('proposal', 'The file containing the proposal')
  .addOptionalParam('safeAddress', 'the address of the multisig contract')
  .addOptionalParam(
    'chainId',
    'the id of the chain to fetch from (default to hardhat provider)'
  )
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal: proposalPath, safeAddress, params }) => {
    // eslint-disable-next-line global-require
    const { loadProposal } = require('../helpers/gov')
    const { calls } = await loadProposal(resolve(proposalPath), params)

    // eslint-disable-next-line global-require
    const submitTx = require('../scripts/multisig/submitTx')
    await submitTx({ safeAddress, tx: calls })
  })

task('safe:add-owner', 'Submit a new owner to a multisig')
  .addParam('newOwner', 'The address of the new safe owner')
  .addOptionalParam('safeAddress', 'the address of the multisig contract')
  .addOptionalParam('threshold', 'new threshold for the multisig contract')
  .setAction(async ({ newOwner, safeAddress }) => {
    // eslint-disable-next-line global-require
    const addOwner = require('../scripts/multisig/addOwner')
    await addOwner({ safeAddress, newOwner })
  })
