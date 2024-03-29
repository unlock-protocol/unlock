/**
 * Deploy a bridged ERC20 UDT token contract on Arbitrum network
 *
 * Please edit the chain ids constant below to use
 * TODO: move to `governance` workspace - Arbitrum SDK requires ethers@5
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const l1BridgeAbi = require('./abi/l1standardbridge.json')
const { ethers } = require('hardhat')

const L1_CHAIN_ID = 1 // mainnet (Sepolia 11155111)
const l2_CHAIN_ID = 8453 // BASE (BASE Sepolia 84534)
const l1StandardBridge = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'
const defaultGasAmount = '100000'

async function main({
  l1ChainId = L1_CHAIN_ID,
  l2ChainId = l2_CHAIN_ID,
  amount = 100000000000000000n, // default to 0.1
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  const [l1, l2] = await Promise.all([
    await getNetwork(l1ChainId),
    await getNetwork(l2ChainId),
  ])

  const l1TokenAddress = l1.unlockDaoToken.address
  const l2TokenAddress = l2.unlockDaoToken.address

  console.log(
    `Bridging tokens from L1 ${l1.name} (${l1.id}) to L2 ${l2.name} (${l2.id})...
    - L1: ${l1TokenAddress} 
    - L2: ${l2TokenAddress}`
  )

  // Create the RPC providers and wallets
  const l1Provider = new ethers.providers.StaticJsonRpcProvider(l1.provider)
  const l1Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l1Provider)

  const bridgeContract = new ethers.Contract(
    l1StandardBridge,
    l1BridgeAbi,
    l1Wallet
  )

  const sender = await bridgeContract.l2TokenBridge()
  console.log('sender', sender)

  const l1Token = await ethers.getContractAt('IERC20', l1TokenAddress, l1Wallet)

  // approval
  const allowance = await l1Token.allowance(l1Wallet.address, l1StandardBridge)
  if (allowance < amount) {
    console.log('approve bridge to access token')
    const approveResult = await l1Token.approve(l1StandardBridge, amount)
    console.log('approve result', approveResult)
  } else {
    console.log('token is approved to deposit')
  }

  // deposit to bridge
  try {
    const bridgeResult = await bridgeContract.depositERC20(
      l1TokenAddress,
      l2TokenAddress,
      amount,
      defaultGasAmount,
      '0x' // pass empty data
    )
    console.log('bridge token result', bridgeResult)
    const transactionReceipt = await bridgeResult.wait()
    console.log('token transaction receipt', transactionReceipt)
  } catch (e) {
    console.log('bridge token result error', e)
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
