const { provider } = require('hardhat')
const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = './helpers/constants'

const Erc20Token = artifacts.require(
  '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20'
)

module.exports = async function getTokenBalance(account, tokenAddress) {
  if (tokenAddress === ADDRESS_ZERO) {
    return new BigNumber(await provider.getBalance(account))
  }
  return new BigNumber(
    await (await Erc20Token.at(tokenAddress)).balanceOf(account)
  )
}
