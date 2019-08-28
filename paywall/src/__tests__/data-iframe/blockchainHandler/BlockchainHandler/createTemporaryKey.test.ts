import {
  lockAddresses,
  firstLockLocked,
} from '../../../test-helpers/setupBlockchainHelpers'
import { createTemporaryKey } from '../../../../data-iframe/blockchainHandler/BlockchainHandler'

describe('BlockchainHandler - createTemporaryKey', () => {
  const lock = firstLockLocked

  it("should create a temporary key based on the lock's expiration", () => {
    expect.assertions(1)
    const locks = {
      [lock.address]: lock,
    }

    const lockAddress = lockAddresses[0]
    const owner = '0xC0FFEE'

    // Probably not the best way to test this!
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000)
    const expectedKey = {
      expiration: currentTimeInSeconds + lock.expirationDuration,
      lock: lockAddress,
      owner,
    }

    const temporaryKey = createTemporaryKey(lockAddress, owner, locks)

    expect(temporaryKey).toEqual(expectedKey)
  })

  it('should create a temporary key based on the default value', () => {
    expect.assertions(1)

    // Probably not the best way to test this!
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000)
    const secondsInADay = 60 * 60 * 24
    const expectedExpiration = currentTimeInSeconds + secondsInADay
    const lockAddress = lockAddresses[1]
    const owner = '0xDECADE'

    const expectedKey = {
      expiration: expectedExpiration,
      lock: lockAddress,
      owner,
    }

    const temporaryKey = createTemporaryKey(lockAddress, owner, {})

    expect(temporaryKey).toEqual(expectedKey)
  })
})
