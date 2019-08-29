import { getUnlockedLockAddresses } from '../../../data-iframe/Mailbox'
import { lockAddresses } from '../../test-helpers/setupBlockchainHelpers'
import { currentTimeInSeconds } from '../../../utils/durations'

const theFuture = currentTimeInSeconds() + 2000
const account = '0xC0FFEE'

const notEnoughKeysData = {}

// The case when we have received one key, even though we don't have
// the rest of the blockchainData.
const oneValidKeyData = {
  [lockAddresses[1]]: {
    expiration: theFuture,
    lock: lockAddresses[1],
    owner: account,
  },
}

// The case where we still have a "default key"
const fakeKeysData = {
  [lockAddresses[0]]: {
    expiration: -1,
    lock: lockAddresses[0],
    owner: account,
  },
  [lockAddresses[1]]: {
    expiration: 0,
    lock: lockAddresses[1],
    owner: account,
  },
  [lockAddresses[2]]: {
    expiration: 0,
    lock: lockAddresses[2],
    owner: account,
  },
}

const allKeysExpiredData = {
  [lockAddresses[0]]: {
    expiration: 0,
    lock: lockAddresses[0],
    owner: account,
  },
  [lockAddresses[1]]: {
    expiration: 0,
    lock: lockAddresses[1],
    owner: account,
  },
  [lockAddresses[2]]: {
    expiration: 0,
    lock: lockAddresses[2],
    owner: account,
  },
}

const unexpiredKeysData = {
  [lockAddresses[0]]: {
    expiration: 1,
    lock: lockAddresses[0],
    owner: account,
  },
  [lockAddresses[1]]: {
    expiration: theFuture,
    lock: lockAddresses[1],
    owner: account,
  },
  [lockAddresses[2]]: {
    expiration: 0,
    lock: lockAddresses[2],
    owner: account,
  },
}

const multipleValidKeyData = {
  ...unexpiredKeysData,
  [lockAddresses[0]]: {
    // arbitrarily different time in the future from the other valid key
    expiration: theFuture + 500,
    lock: lockAddresses[0],
    owner: account,
  },
}

describe('Mailbox - getUnlockedLockAddresses', () => {
  it('should return [] if there are no keys', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(notEnoughKeysData)).toEqual([])
  })

  it('should return [] if all keys are expired (including a "default" key)', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(fakeKeysData)).toEqual([])
  })

  it('should return [] if all keys are expired (all "real" keys)', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(allKeysExpiredData)).toEqual([])
  })

  it('should return an array containing the address of an unlocked lock (not all data from chain)', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(oneValidKeyData)).toEqual([
      lockAddresses[1],
    ])
  })

  it('should return an array containing the unlocked lock addresses when there is a single valid key', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(unexpiredKeysData)).toEqual([
      lockAddresses[1],
    ])
  })

  it('should return an array containing the unlocked lock addresses when there are multiple valid keys', () => {
    expect.assertions(1)

    expect(getUnlockedLockAddresses(multipleValidKeyData)).toEqual([
      lockAddresses[0],
      lockAddresses[1],
    ])
  })
})
