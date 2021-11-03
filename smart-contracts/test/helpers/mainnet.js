const { ethers, network, config } = require('hardhat')

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

module.exports = {
  resetNodeState,
  impersonate,
  addSomeETH,
}
