const { ethers, network, config } = require('hardhat')
const { getDeployment } = require('../../helpers/deployments')

// some useful addresses
const UNISWAP_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

// currencies
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const SHIBA_INU = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

const resetNodeState = async () => {
  // reset fork
  const { forking } = config.networks.hardhat
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: forking.url,
          blockNumber: forking.blockNumber,
        },
      },
    ],
  })
}

const addSomeETH = async (address) => {
  const balance = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))
  await network.provider.send('hardhat_setBalance', [address, balance])
}

const impersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  })
  await addSomeETH(address) // give some ETH just in case
}
const stopImpersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [address],
  })
}

const toBytes32 = (bn) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32))
}

const addUDT = async (recipientAddress, amount = 1000) => {
  const { chainId } = await ethers.provider.getNetwork()

  // UDT contract
  const { address: udtAddress } = getDeployment(
    chainId,
    'UnlockDiscountTokenV3'
  )
  const udtAmount = ethers.utils.parseEther(`${amount}`)

  // NB: slot has been found by using slot20 - see https://kndrck.co/posts/local_erc20_bal_mani_w_hh/
  // Get storage slot index
  const index = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [recipientAddress, 51] // key, slot
  )

  // Manipulate local balance (needs to be bytes32 string)
  await network.provider.request({
    method: 'hardhat_setStorageAt',
    params: [udtAddress, index.toString(), toBytes32(udtAmount).toString()],
  })
  // Just mines to the next block
  await ethers.provider.send('evm_mine', [])
}

const getDictator = async () => {
  // main UDT holder on mainnet
  const udtHolder = '0xa39b44c4affbb56b76a1bf1d19eb93a5dfc2eba9'
  await impersonate(udtHolder)
  const dictator = await ethers.getSigner(udtHolder)
  return dictator
}

module.exports = {
  resetNodeState,
  impersonate,
  stopImpersonate,
  getDictator,
  addUDT,
  addSomeETH,
  USDC,
  WETH,
  DAI,
  SHIBA_INU,
  UNISWAP_FACTORY_ADDRESS,
}
