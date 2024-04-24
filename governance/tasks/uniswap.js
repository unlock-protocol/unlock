const { task } = require('hardhat/config')
const { types } = require('hardhat/config')

task('oracle:check', 'Show the rate for a token from Unlock oracle')
  .addOptionalParam('token', 'The symbol of the token to check')
  .addOptionalParam('amount', 'Amount of tokens to check (ex. 1 ETH)')
  .addOptionalParam('oracle', 'Address of an oracle contract')
  .addOptionalParam('fee', 'Pool fee for the oracle contract', 500, types.int)
  .addOptionalParam(
    'tokenOut',
    'The symbol of the token pair (default to Wrapped Native)'
  )
  .setAction(async ({ token, amount, tokenOut, oracle, fee }) => {
    // eslint-disable-next-line global-require
    const oracleCheck = require('../scripts/uniswap/oracle')
    await oracleCheck({
      tokenIn: token,
      tokenOut,
      amount,
      oracleAddress: oracle,
      fee,
    })
  })
