const { ethers } = require('hardhat')
const TestERC20 = artifacts.require('TestERC20')

const deployERC20 = async (deployer, isEthers = false) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer
  const Token = await ethers.getContractFactory('TestERC20', signer)
  const token = await Token.deploy()
  await token.deployed()

  if (isEthers) {
    return token
  }
  // return truffle artifact as default
  return TestERC20.at(token.address)
}

module.exports = {
  deployERC20,
}
