const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { reverts } = require('../../helpers')

const emitHookUpdatedEvent = ({ events, hookName, hookAddress }) => {
  const { args } = events.find(({ event }) => event === 'EventHooksUpdated')
  Object.keys(args)
    .filter((h) => isNaN(parseInt(h))) // remove array indexes from keys
    .map((h) => {
      assert.equal(args[h], h === hookName ? hookAddress : ADDRESS_ZERO)
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
