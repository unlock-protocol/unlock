const helpers = require('@nomicfoundation/hardhat-network-helpers')
const { network, ethers } = require('hardhat')

async function increaseTime(durationInHours) {
  const { timestamp } = await ethers.provider.getBlock('latest')
  await network.provider.send('evm_increaseTime', [
    ethers.BigNumber.from(durationInHours).mul(3600).add(timestamp).toNumber(),
  ])
}

async function advanceBlock() {
  await helpers.mine(1)
}

async function advanceBlockTo(blockNumber) {
  await helpers.mineUpTo(blockNumber)
}

async function getLatestBlock() {
  return await helpers.time.latestBlock()
}

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
  increaseTime,
  advanceBlock,
  advanceBlockTo,
  getLatestBlock,
}
