const { ethers } = require('hardhat')
const WethABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/weth.json')

const deployERC20 = async (deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer
  const Token = await ethers.getContractFactory('TestERC20', signer)
  const token = await Token.deploy()
  return token
}

const deployWETH = async (deployer) => {
  const { abi, bytecode } = WethABI
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer
  const WETH = new ethers.ContractFactory(abi, bytecode, signer)
  const weth = await WETH.deploy()

  // return truffle artifact for now
  return weth
}

module.exports = {
  deployERC20,
  deployWETH,
}
