/**
 * Deploy a bridged ERC20 UDT token contract on Arbitrum network
 *
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const l1BridgeAbi = require('../../../helpers/abi/l1standardbridge.json')
const ethers = require('ethers')
const abiERC20 = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')

// tweak these params
const USE_TESTNET = false
const SIMULATION = true
const gasLimit = 1000000
const defaultGasAmount = '200000'

// parse network details
const L1_CHAIN_ID = USE_TESTNET ? 11155111 : 1 // mainnet (Sepolia 11155111)
const l2_CHAIN_ID = USE_TESTNET ? 84532 : 8453 // BASE (BASE Sepolia 84532)
const standardBridges = {
  1: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
  11155111: '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
}
const L1_STANDARD_BRIDGE = standardBridges[L1_CHAIN_ID]

async function main({
  l1ChainId = L1_CHAIN_ID,
  l2ChainId = l2_CHAIN_ID,
  l1StandardBridge = L1_STANDARD_BRIDGE,
  amount = `100000000000000000`, // default to 0.1
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
  const l1Provider = new ethers.JsonRpcProvider(l1.provider)
  const l1Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l1Provider)

  const bridgeContract = new ethers.Contract(
    l1StandardBridge,
    l1BridgeAbi,
    l1Wallet
  )

  const sender = await bridgeContract.l2TokenBridge()
  console.log('sender', sender)

  const l1Token = new ethers.Contract(l1TokenAddress, abiERC20, l1Wallet)

  // check balance
  const balance = await l1Token.balanceOf(l1Wallet.address)
  if (balance.lt(amount)) {
    throw new Error(`Balance too low`)
  }

  // approval
  const allowance = await l1Token.allowance(l1Wallet.address, l1StandardBridge)
  if (allowance.lt(amount)) {
    console.log('approve bridge to access token...')
    const { hash } = await l1Token.approve(l1StandardBridge, amount)
    console.log(`approved (tx: ${hash})`)
  } else {
    console.log('token approval ok for deposit')
  }

  const bridgeArgs = {
    l1TokenAddress,
    l2TokenAddress,
    amount,
    defaultGasAmount,
    emptyData: '0x',
  }

  // show gas estimate
  const gasEstimate = await bridgeContract.estimateGas.bridgeERC20(
    ...Object.values(bridgeArgs),
    {
      gasLimit,
    }
  )
  const { baseFeePerGas } = await l1Provider.getBlock('latest')
  const gasCostEstimate = baseFeePerGas.mul(gasEstimate)
  console.log(`Gas cost estimate: ${ethers.formatEther(gasCostEstimate)} ETH`)
  // deposit to bridge
  if (!SIMULATION) {
    try {
      const bridgeResult = await bridgeContract.bridgeERC20(
        ...Object.values(bridgeArgs),
        {
          gasLimit,
        }
      )
      console.log('bridge deposit done', bridgeResult)
      const { transactionHash } = await bridgeResult.wait()
      console.log(`(tx: ${transactionHash})`)
    } catch (e) {
      console.log('bridge token result error', e)
    }
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
