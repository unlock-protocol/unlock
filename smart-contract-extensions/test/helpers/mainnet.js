const { ethers, network } = require('hardhat')

const FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

// currencies
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const ETH = ethers.constants.AddressZero
// export const USDC_WETH_POOL_ADDRESS = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'

const addSomeETH = async (address) => {
  const balance = ethers.utils.hexStripZeros(
    ethers.utils.parseEther('1000').toHexString()
  )
  await network.provider.send('hardhat_setBalance', [address, balance])
}

const impersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  })
  await addSomeETH(address)
}

module.exports = {
  USDC,
  WETH,
  DAI,
  ETH,
  FACTORY_ADDRESS,
  impersonate,
  addSomeETH,
}
