const { network, ethers } = require('hardhat')

async function increaseTimeTo(expirationTs) {
  expirationTs =
    typeof expirationTs === 'number'
      ? expirationTs
      : expirationTs === 'string'
      ? parseInt(expirationTs)
      : expirationTs.toNumber()

  const { timestamp } = await ethers.provider.getBlock('latest')

  if (timestamp > expirationTs) {
    throw new Error(
      `Cannot increase time (${timestamp}) to the past (${expirationTs})`
    )
  }
  await network.provider.send('evm_increaseTime', [expirationTs])
}

module.exports = {
  increaseTimeTo,
}
