const { getNetwork, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { getProvider } = require('../../helpers/multisig')

const { ethers } = require('hardhat')
const fs = require('fs-extra')

const L1_UDT_SEPOLIA = '0x0B26203E3DE7E680c9749CFa47b7ea37fEE7bd98'

async function main({
  l1TokenAddress = L1_UDT_SEPOLIA,
  tokenSymbol = 'UDT.e',
  tokenName = 'UnlockDiscountToken (bridged)',
  l2ChainId = 84532, // Base Sepolia
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  // get l2 network info
  const l2 = await getNetwork(l2ChainId)

  console.log(
    `Deploying bridged token from L1 ${l1TokenAddress} to L2 ${l2.name} (${l2.id})...
    - token: ${l1TokenAddress} `
  )

  // Create the RPC providers and wallets
  const l2Provider = await getProvider(l2ChainId)
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
