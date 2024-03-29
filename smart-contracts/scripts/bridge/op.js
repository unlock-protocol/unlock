/**
 * Bridge tokens to Optimism networks
 *
 * TODO: move to governance foldder
 * NB: this scripts belong to `governance` folder but lives here as the Optimsim sdk
 * requires ethers v5 ( in use in this workspace), while the governance workspace
 * uses v6.
 */

const {
  getERC20Contract,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')
const { ethers } = require('hardhat')
const optimism = require('@eth-optimism/sdk')

// edit default values
const L1_CHAIN_ID = 11155111 // default to Sepolia
const l2_CHAIN_ID = 84532 // default to Base Sepolia

async function main({
  l1ChainId = L1_CHAIN_ID,
  l2ChainId = l2_CHAIN_ID,
  amount = 1000000000000000000n, // default to 1
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

  const showBalances = async (text = 'Balance') => {
    console.log(
      `${text}
      - l1: ${(await l1Token.balanceOf(l1Wallet.address)).toString()}
      - l2: ${(await l2Token.balanceOf(l2Wallet.address)).toString()}`
    )
  }

  // log balances
  await showBalances('Balance before')

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
  await showBalances('Balance after')
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
