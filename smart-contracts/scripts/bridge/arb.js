/**
 * Deploy a bridged ERC20 UDT token contract on Arbitrum network
 *
 * Please edit the chain ids constant below to use
 * TODO: move to `governance` workspace - Arbitrum SDK requires ethers@5
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

const {
  getL2Network,
  Erc20Bridger,
  L1ToL2MessageStatus,
} = require('@arbitrum/sdk')
const { ethers } = require('hardhat')

const L1_CHAIN_ID = 1 // mainnet (Sepolia 11155111)
const l2_CHAIN_ID = 42161 // ARB (ARB Sepolia 421614)

async function main({
  l1ChainId = L1_CHAIN_ID,
  l2ChainId = l2_CHAIN_ID,
  amount = 100000000000000000n, // default to 0.1
} = {}) {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  // unlock networks info
  const [l1, l2] = await Promise.all([
    await getNetwork(l1ChainId),
    await getNetwork(l2ChainId),
  ])

  const l1TokenAddress = l1.unlockDaoToken.address

  console.log(
    `Bridging tokens from L1 ${l1.name} (${l1.id}) to L2 ${l2.name} (${l2.id})...
    - UDT L1: ${l1TokenAddress}`
  )

  // get wallets and providers
  const l1Provider = new ethers.providers.StaticJsonRpcProvider(l1.provider)
  const l1Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l1Provider)
  // const l2Provider = await getProvider(l2ChainId)
  const l2Provider = new ethers.providers.StaticJsonRpcProvider(l2.provider)

  // token contract instance
  const l1Token = await ethers.getContractAt('IERC20', l1TokenAddress, l1Wallet)

  // use arb sdk
  const l2Network = await getL2Network(l2Provider)
  const erc20Bridger = new Erc20Bridger(l2Network)
  const l2TokenAddress = await erc20Bridger.getL2ERC20Address(
    l1TokenAddress,
    l1Provider
  )
  console.log(`L2 ERC20 bridged token contract at ${l2TokenAddress}`)

  // get arb gateway address
  const expectedL1GatewayAddress = await erc20Bridger.getL1GatewayAddress(
    l1TokenAddress,
    l1Provider
  )
  console.log(`Using ARB Gateway at: ${expectedL1GatewayAddress}`)
  const balance = await l1Token.balanceOf(l1Wallet.address)
  console.log(`Balances:
  - L1 Wallet: ${balance.toString()}
  - L1 Gateway / L2 totalSupply: ${await l1Token.balanceOf(
    expectedL1GatewayAddress
  )}`)

  if (balance.lt(amount)) {
    throw new Error('Insufficient UDT balance on L1. Can not bridge')
  }

  console.log('Approving the Bridge to spend token...')
  const approveTx = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: l1TokenAddress,
  })
  const approveRec = await approveTx.wait()
  console.log(
    `You successfully allowed the Arbitrum Bridge to spend UDT ${approveRec.transactionHash}`
  )

  console.log(`Depositing ${amount} to L2 via the Gateway bridge contract...`)
  const depositTx = await erc20Bridger.deposit({
    amount,
    erc20L1Address: l1TokenAddress,
    l1Signer: l1Wallet,
    l2Provider: l2Provider,
  })

  // Now we wait for L1 and L2 side of transactions to be confirmed
  console.log(
    `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `
  )
  const depositRec = await depositTx.wait()
  const l2Result = await depositRec.waitForL2(l2Provider)
  l2Result.complete
    ? console.log(
        `L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`
      )
    : console.log(
        `L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`
      )

  // now fetch the token address created on l2
  if (!l2TokenAddress) {
    console.log('Get address on L2...')
    const l2TokenAddress = await erc20Bridger.getL2ERC20Address(
      l1TokenAddress,
      l1Provider
    )
    console.log(`L2 token contract created at ${l2TokenAddress}`)
  }
  const l2Token = erc20Bridger.getL2TokenContract(l2Provider, l2TokenAddress)

  console.log(
    `Balances:
    - l1: ${(await l1Token.balanceOf(l1Wallet.address)).toString()}
    - l2: ${(await l2Token.balanceOf(l1Wallet.address)).toString()}`
  )
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
