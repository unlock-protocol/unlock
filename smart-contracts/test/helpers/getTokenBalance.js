const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

module.exports = async function getTokenBalance(account, tokenAddress) {
  if (tokenAddress === Web3Utils.padLeft(0, 40)) {
    return new BigNumber(await web3.eth.getBalance(account))
  } else {
    return new BigNumber(
      await (await TestErc20Token.at(tokenAddress)).balanceOf(account)
    )
  }
}
