const { ethers, network, config } = require('hardhat')

const resetState = async () => {
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

const impersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  })
  // give some ETH
  const balance = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))
  await network.provider.send('hardhat_setBalance', [address, balance])
}

module.exports = {
  resetState,
  impersonate,
}
