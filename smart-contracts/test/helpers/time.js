const helpers = require('@nomicfoundation/hardhat-network-helpers')
const { ethers } = require('hardhat')

async function increaseTime(durationInSec = 1) {
  const { timestamp } = await ethers.provider.getBlock()
  const newTimestamp = timestamp + durationInSec
  await increaseTimeTo(newTimestamp)
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

async function increaseTimeTo(newTimestamp) {
  await helpers.time.increaseTo(BigInt(newTimestamp.toString()))
}

module.exports = {
  increaseTimeTo,
  increaseTime,
  advanceBlock,
  advanceBlockTo,
  getLatestBlock,
}
