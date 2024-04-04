const { task } = require('hardhat/config')

task('oracle:check', 'Show the rate for a token from Unlock oracle')
  .addParam('token', 'The symbol of the token to check')
  .addOptionalParam('amount', 'Amount of tokens to check (ex. 1 ETH)')
  .addOptionalParam(
    'tokenOut',
    'The symbol of the token pair (default to Wrapped Native)'
  )
  .setAction(async ({ token, amount, tokenOut }) => {
    // eslint-disable-next-line global-require
    const oracleCheck = require('../scripts/uniswap/oracle')
    await oracleCheck({ tokenIn: token, tokenOut, amount })
  })
