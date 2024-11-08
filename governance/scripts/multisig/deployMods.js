/**
 *
 * A small util to show the command that needs to be run to
 * deploy SAFE modules used by cross-chain governance.
 *
 * Usage: yarn hardhat run scripts/multisig/deployMods.js --network <network_name>
 */

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const {
  deployProxy,
  predictProxyAddress,
} = require('@gnosis-guild/zodiac-core')
const { ContractAddresses } = require('@gnosis-guild/zodiac')
const { ethers, network } = require('hardhat')

// DAO coordinates
const daoTimelockAddress = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'
const daoChainId = 8453

// console.log(ContractAddresses)
// in seconds
const ONE_DAY = 24 * 3600

const wrapEIP1193Provider = function (provider, signer) {
  return {
    /**
     * Handles requests to the provider.
     * Intercepts eth_sendTransaction requests to use the provided Signer for signing the transaction.
     *
     * @param {object} request - The request object containing the method and parameters.
     * @param {string} request.method - The JSON-RPC method.
     * @param {Array<any>} request.params - The parameters for the JSON-RPC method.
     * @returns {Promise<any>} The result of the request.
     */
    request: async ({ method, params }) => {
      if (method === 'eth_sendTransaction') {
        const { hash } = await signer.sendTransaction(params[0])
        return hash
      }

      return provider.request({ method, params })
    },
  }
}

const deployDelay = async () => {
  const { multisig, id } = await getNetwork()
  console.log(`Deploying Zodiac Delay module...`)
  const [signer] = await ethers.getSigners()
  const { provider } = network

  const saltNonce = 1
  const mastercopy = ContractAddresses[id].delay

  const setupArgs = {
    types: ['address', 'address', 'address', 'uint256', 'uint256'],
    values: [
      multisig, // owner
      multisig, // avatar
      multisig, // target
      ONE_DAY * 2, // cooldown 2 days
      ONE_DAY * 90, // expiration 90 days
    ],
  }

  // compute deterministic address
  const expectedAddress = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  })
  console.log(`Deployment expected at ${expectedAddress}`)

  // deploy actual contract
  const { address } = await deployProxy({
    mastercopy, // the mastercopy address
    setupArgs,
    saltNonce, // an integer, used to salt proxy deployment
    provider: wrapEIP1193Provider(provider, signer), // an EIP1193 compliant provider
  })
  console.log(`Done. Module deployed at ${address}.`)
  return address
}

const deployConnext = async (delayModAddress) => {
  const { multisig, id } = await getNetwork()
  console.log(`Deploying Zodiac Delay module...`)
  const [signer] = await ethers.getSigners()
  const { provider } = network

  const saltNonce = 1
  const { connext: mastercopy } = ContractAddresses[id]

  const {
    dao: {
      governanceBridge: { connext },
    },
  } = await getNetwork()
  const {
    dao: {
      governanceBridge: { domainId: daoDomainId },
    },
  } = await getNetwork(daoChainId)

  const setupArgs = {
    types: ['address', 'address', 'address', 'address', 'uint256', 'address'],
    values: [
      multisig, // owner
      multisig, // avatar
      delayModAddress, // target
      daoTimelockAddress, // _originSender
      daoDomainId, // _origin
      connext, // _connext
    ],
  }

  // compute deterministic address
  const expectedAddress = predictProxyAddress({
    mastercopy,
    setupArgs,
    saltNonce,
  })
  console.log(`Deployment expected at ${expectedAddress}`)

  // deploy actual contract
  const { address } = await deployProxy({
    mastercopy, // the mastercopy address
    setupArgs,
    saltNonce, // an integer, used to salt proxy deployment
    provider: wrapEIP1193Provider(provider, signer), // an EIP1193 compliant provider
  })
  console.log(`Done. Module deployed at ${address}.`)
  return address
}

// if any network is present this array, only these will be executed

async function main() {
  const { dao } = await getNetwork(network.config.chainId)
  console.log('\n', network.config.name, '\n')

  let delayModAddress
  let connextModAddress

  if (!dao.governanceBridge.modules || !dao.governanceBridge.modules.delayMod) {
    delayModAddress = await deployDelay()
  } else {
    delayModAddress = dao.governanceBridge.modules.delayMod
  }
  if (dao.governanceBridge.modules && dao.governanceBridge.modules.connextMod) {
    connextModAddress = dao.governanceBridge.modules.connextMod
    console.log(
      `Connext already deployed at ${dao.governanceBridge.modules.connextMod}`
    )
  }
  if (delayModAddress && !connextModAddress) {
    console.log(`Delay mod at ${delayModAddress}`)
    connextModAddress = await deployConnext(delayModAddress)
  }

  console.log(`
Please update the \`dao.governanceBridge\` section of the networks package with the following:

  modules: {
    delayMod: ${delayModAddress},
    connextMod: ${connextModAddress}
  }

`)
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
