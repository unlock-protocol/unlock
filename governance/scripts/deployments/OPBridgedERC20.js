/**
 * Deploy a bridged ERC20 UDT token contract on Optimism networks
 *
 * Please edit the chain ids constant below to use
 */
const { getNetwork, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { getProvider } = require('../../helpers/multisig')

const { ethers } = require('hardhat')
const fs = require('fs-extra')

// base factory address from https://docs.base.org/base-contracts/
const OptimismMintableERC20Factory = {
  base: '0xf23d369d7471bD9f6487E198723eEa023389f1d4',
  optimism: '0x4200000000000000000000000000000000000012',
  baseSepolia: '0x4200000000000000000000000000000000000012',
}

// OP factory address
// const OP_OptimismMintableERC20Factory =

// edit default values
const L1_CHAIN_ID = 11155111 // default to (Sepolia 11155111)
const l2_CHAIN_ID = 84532 // default to (Base Sepolia 84532)

async function main({
  tokenSymbol = 'UDT',
  tokenName = 'UnlockDiscountToken',
  factoryAddress = OptimismMintableERC20Factory.baseSepolia, // bridged erc20 factory address
  l1ChainId = L1_CHAIN_ID,
  l2ChainId = l2_CHAIN_ID,
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env
  const {
    name: l1Name,
    unlockDaoToken: { address: l1TokenAddress },
  } = await getNetwork(l1ChainId)

  if (!l1TokenAddress) {
    throw new Error(`Missing UDT on L1 ${l1Name}`)
  }
  // get l2 network info
  const l2 = await getNetwork(l2ChainId)
  console.log(
    `Deploying bridged token from L1 (${l1Name}) ${l1TokenAddress} to L2 ${l2.name} (${l2.id})...
    - token: ${l1TokenAddress} `
  )

  // Create the RPC providers and wallets
  const { provider: l2Provider } = await getProvider(l2ChainId)
  const l2Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l2Provider)

  // read ABI from node_modules
  const { abi: factoryAbi } = JSON.parse(
    fs
      .readFileSync(
        '../node_modules/@eth-optimism/contracts-bedrock/deployments/mainnet/OptimismMintableERC20Factory.json'
      )
      .toString()
      .replace(/\n/g, '')
  )

  // get factory contract instance
  const factory = await ethers.getContractAt(
    factoryAbi,
    factoryAddress,
    l2Wallet
  )

  // create bridged token
  const tx = await factory.createOptimismMintableERC20(
    l1TokenAddress,
    tokenName,
    tokenSymbol
  )

  // fetch info from tx
  const receipt = await tx.wait()
  const {
    args: { localToken },
    hash,
  } = await getEvent(receipt, 'OptimismMintableERC20Created')

  console.log(`Bridged token deployed at: ${localToken} (${hash})`)
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
