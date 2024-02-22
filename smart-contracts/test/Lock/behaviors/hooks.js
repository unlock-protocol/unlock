const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { reverts } = require('../../helpers')

const emitHookUpdatedEvent = ({ events, hookName, hookAddress }) => {
  const { args } = events.find(({ event }) => event === 'EventHooksUpdated')

  Object.keys(args).map((h) => {
    h === hookName
      ? assert.equal(args[hookName], hookAddress)
      : assert.equal(args.onKeyPurchaseHook, ADDRESS_ZERO)
  })
}

const canNotSetNonContractAddress = async ({ lock, index }) => {
  const [, , , signer] = await ethers.getSigners()
  const args = Array(7).fill(ADDRESS_ZERO)
  args[index] = signer.address
  await reverts(lock.setEventHooks(...args), `INVALID_HOOK(${index})`)
}

module.exports = {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
}
