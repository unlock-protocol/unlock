const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { ethers } = require('hardhat')
const fs = require('fs-extra')

const L1_TEST_TOKEN = '0x5589BB8228C07c4e15558875fAf2B859f678d129'

const OP_SEPOLIA_NETWORK = {
  name: 'Op Sepolia',
  id: 11155420,
  provider: 'https://sepolia.optimism.io',
}

async function main({
  l1TokenAddress = L1_TEST_TOKEN,
  tokenSymbol = 'UDT.e',
  tokenName = 'UnlockDiscountToken (bridged)',
  l2ChainId = OP_SEPOLIA_NETWORK.id, // 10 for OP Mainnet
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  // get l2 network info
  const l2 = OP_SEPOLIA_NETWORK.id
    ? OP_SEPOLIA_NETWORK
    : await getNetwork(l2ChainId)

  console.log(
    `Deploying bridged token from L1 ${l1TokenAddress} to L2 ${l2.name} (${l2.id})...
    - token: ${l1TokenAddress} `
  )

  // Create the RPC providers and wallets
  const l2Provider = new ethers.providers.StaticJsonRpcProvider(l2.provider)
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
  const factoryAddress = '0x4200000000000000000000000000000000000012'
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
  const { events, transactionHash } = await tx.wait()
  const {
    args: { localToken },
  } = events.find(({ event }) => event === 'OptimismMintableERC20Created')

  console.log(`Bridged token deployed at: ${localToken} (${transactionHash})`)
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
