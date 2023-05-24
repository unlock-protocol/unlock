/**
 * Get a swap route using Uniswap Universal Router
 * This also demonstrate how to use the frontend lib (see `getUniswapRoute` for more details)
 * with either passing an already signed calldata, or sending a tx for approval. Check
 * the `usePermit2Sig` var for more.
 *
 * You can test locall using
 *
 * RUN_FORK=1 yarn hardhat run scripts/uniswap/quote.js
 */
const { ethers } = require('hardhat')

const {
  getUniswapTokens,
  getUniswapRoute,
  addERC20,
  MAX_UINT,
  MAX_UINT160,
  getBalance,
  V3_SWAP_ROUTER_ADDRESS,
  PERMIT2_ADDRESS,
  makePermit,
  generatePermitSignature,
} = require('../../test/helpers')

const PERMIT2_APPROVE_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint160',
        name: 'amount',
        type: 'uint160',
      },
      {
        internalType: 'uint48',
        name: 'expiration',
        type: 'uint48',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const logBalance = async (token, signer) => {
  const balance = await getBalance(signer.address, token.address)
  console.log(
    `${signer.address}: ${token.symbol} balance: `,
    balance.toString()
  )
}

const isStable = (token) => ['DAI', 'USDC'].includes(token.symbol)

async function main({
  // do we want to use signed message or send a tx?
  usePermit2Sig = false,
} = {}) {
  const tokens = getUniswapTokens()
  // const pair = [tokens.native, tokens.usdc] // works
  // const pair = [tokens.usdc, tokens.native]
  const pair = [tokens.usdc, tokens.dai]

  const token0 = pair[0]
  const token1 = pair[1]

  const [spender, recipient] = await ethers.getSigners()

  console.log(`spender: ${spender.address}`)
  console.log(`recipient: ${recipient.address}`)

  // dest price is 1 ETH or 1000 USDC/DAI
  const keyPrice = ethers.utils.parseUnits(
    isStable(token1) ? '1000' : '1',
    token1.decimals
  )

  console.log(
    `Get quote for: ${token0.symbol} > ${ethers.utils.formatUnits(
      keyPrice.toString(),
      token1.decimals
    )} ${token1.symbol}`
  )

  // approve permit2 to manipulate token0 for us
  const token0_ERC20 = await ethers.getContractAt(
    '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20',
    token0.address
  )
  await token0_ERC20.connect(spender).approve(PERMIT2_ADDRESS, MAX_UINT)

  // permissions
  let permit, signature
  if (usePermit2Sig) {
    // create signed permit
    const permitAmount = ethers.utils.parseUnits(
      token0 === isStable(token1) ? '5000' : '2',
      token0.decimals
    )
    permit = makePermit(token0.address, permitAmount.toString())
    signature = await generatePermitSignature(permit, spender, 1)
  } else {
    const permit2 = await ethers.getContractAt(
      PERMIT2_APPROVE_ABI,
      PERMIT2_ADDRESS
    )
    const txApproval = await permit2.approve(
      token0.address,
      V3_SWAP_ROUTER_ADDRESS,
      MAX_UINT160,
      20_000_000_000_000 // expiration
    )
    const { transactionHash } = await txApproval.wait()
    console.log(`Approved permit2 to spend USDC at tx: ${transactionHash}`)
  }
  console.log(
    `Using Permit2 with ${
      usePermit2Sig ? 'signature' : 'litteral approval (tx)'
    }`
  )

  const routeArgs = {
    tokenIn: token0,
    tokenOut: token1,
    amoutOut: keyPrice,
    recipient: recipient.address,
    permitOptions: {
      usePermit2Sig,
      // add Permit2 sig if needed
      inputTokenPermit: {
        ...permit,
        signature,
      },
    },
  }

  const { swapCalldata, value, swapRouter, amountInMax } =
    await getUniswapRoute(routeArgs)

  // fund the spender correctly
  await addERC20(token0.address, spender.address, amountInMax.permitAmount)

  // check balances before
  console.log('--- balances before')
  await logBalance(token0, spender)
  await logBalance(token1, recipient)

  console.log('--- execute trade...')
  const transaction = {
    data: swapCalldata,
    to: swapRouter,
    value,
    from: spender.address,
    // gasPrice: BigNumber.from(route.gasPriceWei),
  }

  const tx = await spender.sendTransaction(transaction)
  const { transactionHash: tradeHash } = await tx.wait()
  console.log(`Trade executed at ${tradeHash}.`)
  console.log('--- balances after')
  await logBalance(token0, spender)
  await logBalance(token1, recipient)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
