const assert = require('assert')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { reverts } = require('../../helpers')

const emitHookUpdatedEvent = async ({ receipt, hookName, hookAddress }) => {
  const { args } = await getEvent(receipt, 'EventHooksUpdated')
  Object.keys(args)
    .filter((h) => isNaN(parseInt(h))) // remove array indexes from keys
    .map((h) => {
      assert.equal(args[h], h === hookName ? hookAddress : ADDRESS_ZERO)
    })
}

const canNotSetNonContractAddress = async ({ lock, index }) => {
  const [, , , signer] = await ethers.getSigners()
  const args = Array(8).fill(ADDRESS_ZERO)
  args[index] = await signer.getAddress()
  await reverts(lock.setEventHooks(...args), `INVALID_HOOK(${index})`)
}

module.exports = {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
}
