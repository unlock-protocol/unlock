const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const Erc20Token = artifacts.require('IERC20.sol')

module.exports = async function getTokenBalance(account, tokenAddress) {
  if (tokenAddress === Web3Utils.padLeft(0, 40)) {
    return new BigNumber(await web3.eth.getBalance(account))
  }
  return new BigNumber(
    await (await Erc20Token.at(tokenAddress)).balanceOf(account)
  )
}
