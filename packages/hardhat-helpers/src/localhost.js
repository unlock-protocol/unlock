export const isLocalhost = async () => {
  const { ethers } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  return chainId.toString() === '31137'
}

export const getEvent = async (tx, eventName) => {
  const { hash, logs } = tx
  const event = logs.find(
    ({ fragment }) => fragment && fragment.name === eventName
  )
  const { args } = event
  return { logs, args, hash, event }
}

export default {
  isLocalhost,
  getEvent,
}
