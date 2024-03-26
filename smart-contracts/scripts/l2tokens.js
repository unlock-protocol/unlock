const {
  getERC20Contract,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')
const { ethers } = require('hardhat')
const optimism = require('@eth-optimism/sdk')

const L1_UDT_SEPOLIA = '0x0B26203E3DE7E680c9749CFa47b7ea37fEE7bd98'
const L2_UDT_OP_SEPOLIA = '0xfa7AC1c24339f629826C419eC95961Df58563438'

const OP_SEPOLIA_NETWORK = {
  name: 'Op Sepolia',
  id: 11155420,
  provider: 'https://sepolia.optimism.io',
}

async function main({
  l1TokenAddress = L1_UDT_SEPOLIA,
  l2TokenAddress = L2_UDT_OP_SEPOLIA,
  l1ChainId = 11155111, // Sepolia
  l2ChainId = OP_SEPOLIA_NETWORK.id, // 10 for OP Mainnet
  amount = 1000000000000000000n, // default to 1
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  const [l1, l2] = await Promise.all([
    await getNetwork(l1ChainId),
    l2ChainId !== 11155420 ? await getNetwork(l2ChainId) : OP_SEPOLIA_NETWORK,
  ])

  console.log(
    `Bridging tokens from L1 ${l1.name} (${l1.id}) to L2 ${l2.name} (${l2.id})...`
  )

  // Create the RPC providers and wallets
  const l1Provider = new ethers.providers.StaticJsonRpcProvider(l1.provider)
  const l2Provider = new ethers.providers.StaticJsonRpcProvider(l2.provider)
  const l1Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l1Provider)
  const l2Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l2Provider)

  // tokens
  const l1Token = await getERC20Contract(l1TokenAddress, l1Wallet)
  const l2Token = await getERC20Contract(l2TokenAddress, l2Wallet)

  console.log(
    `Amount: ${ethers.utils.formatUnits(
      amount
    )} ${await l1Token.symbol()} to ${await l2Token.symbol()} on L2...`
  )

  const showBalances = async () => {
    console.log(
      `Balance before
      - l1: ${(await l1Token.balanceOf(l1Wallet.address)).toString()}
      - l2: ${(await l2Token.balanceOf(l2Wallet.address)).toString()}`
    )
  }

  // log balances
  await showBalances()

  // sdk init
  const messenger = new optimism.CrossChainMessenger({
    l1ChainId,
    l2ChainId,
    l1SignerOrProvider: l1Wallet,
    l2SignerOrProvider: l2Wallet,
  })

  console.log(`Approving tokens...`)
  const txApprove = await messenger.approveERC20(
    l1TokenAddress,
    l2TokenAddress,
    amount
  )
  await txApprove.wait()

  console.log(`Deposit tokens...`)
  const txDeposit = await messenger.depositERC20(l1Token, l2Token, amount)
  await txDeposit.wait()

  // wait for deposit to be ready
  console.log(`Wait for the deposit to be ready...`)
  await messenger.waitForMessageStatus(
    txDeposit.hash,
    optimism.MessageStatus.RELAYED
  )

  // check balances after operations
  console.log(`Deposit done.`)
  await showBalances()
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
