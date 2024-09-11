/**
 *
 * A small util to show the command that needs to be run to
 * deploy SAFE modules used by cross-chain governance.
 *
 * Usage: yarn hardhat run scripts/multisig/deployMods.js --network <network_name>
 *
 * ### Instructions how to deploy the Zodiac Connext module
 *
 * 1. get the modules code
 * git clone git@github.com:gnosisguild/zodiac-module-connext.git
 *
 * 2. prepare repo
 * yarn
 * yarn build
 *
 * 3. add required network in `hardhat.config.ts` with the following pattern
 * `
 * base: {
 *     url: "https://rpc.unlock-protocol.com/<network id>",
 *     accounts: [process.env.DEPLOYER_PRIVATE_KEY],
 *   },
 * `
 * and block explorer api key
 *
 * `
 * etherscan: {
 *    apiKey: {
 *      base: '<your-api-key>',
 *    }
 * },
 * `
 *
 * 4. export DEPLOYER_PRIVATE_KEY to env
 * 5. run this script to get the commands
 *
 */

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const {
  deployProxy,
  predictProxyAddress,
} = require('@gnosis-guild/zodiac-core')
const { ContractAddresses } = require('@gnosis.pm/zodiac')
const { ethers, network } = require('hardhat')

const owner = '0x246A13358Fb27523642D86367a51C2aEB137Ac6C'
const daoTimelockAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const daoChainId = 1

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
      owner, // owner
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

// if any network is present this array, only these will be executed

async function main() {
  const { governanceBridge, multisig, name } = await getNetwork(
    network.config.chainId
  )
  console.log('\n', network.config.name, '\n')

  let delayModAddress, connextModAddress
  if (!governanceBridge.modules || !governanceBridge.modules.delayMod) {
    delayModAddress = await deployDelay()
  } else {
    delayModAddress = governanceBridge.modules.delayMod
  }
  console.log(`Delay mod at ${delayModAddress}`)
  if (delayModAddress) {
    const {
      governanceBridge: { domainId: daoDomainId },
    } = await getNetwork(daoChainId)

    const argsConnext = [
      '--network',
      name,
      '--avatar',
      multisig,
      '--connext',
      governanceBridge.connext,
      '--origin',
      daoDomainId,
      '--sender',
      daoTimelockAddress,
      '--owner',
      owner,
      '--target',
      delayModAddress,
    ]

    console.log(`To deploy Zodiac Connext Module, please run the following sequence

          1. git clone git@github.com:gnosisguild/zodiac-module-connext.git
          2. adjust network provider in hardhat config (see this script file for more info)
          3. Run the following from the cloned repo
            
            yarn hardhat setup ${argsConnext.join(' ')}

          4. verify the contract 
            
            yarn hardhat verify ${owner} ${multisig} ${delayModAddress} ${daoTimelockAddress} ${daoDomainId} ${governanceBridge.connext} --network ${name} <module-address>
          `)
  } else {
    console.log(`Connext mod at ${governanceBridge.modules.connextMod}`)
  }
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
