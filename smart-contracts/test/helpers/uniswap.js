const { ethers } = require('hardhat')
const UniswapOracle = require('./ABIs/UniswapOracle.json')

export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'

// currencies
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

const deployUniswapOracle = async (deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer

  const Oracle = await ethers.getContractFactory(
    UniswapOracle.abi,
    UniswapOracle.bytecode,
    signer
  )
  const oracle = await Oracle.deploy(UNISWAP_FACTORY_ADDRESS)
  await oracle.deployed()

  return oracle
}

module.exports = {
  deployUniswapOracle,
}
