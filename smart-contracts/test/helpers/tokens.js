const { ethers } = require('hardhat')
const WethABI = require('./ABIs/weth.json')

const TestERC20 = artifacts.require('TestERC20')

const deployERC20 = async (deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer
  const Token = await ethers.getContractFactory('TestERC20', signer)
  const token = await Token.deploy()
  await token.deployed()

  // return truffle artifact for now
  return TestERC20.at(token.address)
}

const deployWETH = async (deployer) => {
  const { abi, bytecode } = WethABI
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer
  const WETH = new ethers.ContractFactory(abi, bytecode, signer)
  const weth = await WETH.deploy()
  await weth.deployed()

  // return truffle artifact for now
  return weth
}

module.exports = {
  deployERC20,
  deployWETH,
}
