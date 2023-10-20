const BigNumber = require('bignumber.js')
const {
  getBalance: getBalanceEthers,
} = require('@unlock-protocol/hardhat-helpers')

async function getBalance(account, tokenAddress) {
  const balance = await getBalanceEthers(account, tokenAddress)
  return new BigNumber(balance.toString())
}

module.exports = {
  getBalance,
  getBalanceEthers,
}
