/**
 * Testing Universal Router
 */
const { ethers } = require('hardhat')

const { 
  getUniswapTokens, 
  getUniswapRoute, 
  addERC20, 
  MAX_UINT, 
  getBalance, 
  PERMIT2_ADDRESS
} = require('../../test/helpers')


const logBalance = async (token, signer) => {
  const balance = await getBalance(signer.address, token.address)
  console.log(`${signer.address}: ${token.symbol} balance: `, balance.toString() )
}

const isStable = (token) => ['DAI', 'USDC'].includes(token.symbol)

async function main () {

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
  
  console.log(`Get quote for: ${token0.symbol} > ${
    ethers.utils.formatUnits(keyPrice.toString(), token1.decimals)
  } ${token1.symbol}`)

  // approve permit2 to manipulate token0 for us
  const token0_ERC20 = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20', token0.address)
  await token0_ERC20.connect(spender).approve(PERMIT2_ADDRESS, MAX_UINT)
  
  const permitOptions = {
    // do we want to use signed message or send a tx?
    usePermit2Sig: true,
    // max amount to spend / allow (here 5000 USDC or 2 ETH)
    permitAmount: ethers.utils.parseUnits(
      token0 === isStable(token1) ? '5000' : '2',
      token0.decimals
    )
  }

  const { 
    swapCalldata, 
    value, 
    swapRouter,
    amountInMax
   } = await getUniswapRoute({
    tokenIn: token0, 
    tokenOut: token1, 
    amoutOut: keyPrice,
    recipient: recipient.address,
    permitOptions
  })

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
  };

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