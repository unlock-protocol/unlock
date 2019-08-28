import createTemporaryKey, {
  currentTimeInSeconds,
} from '../../../data-iframe/blockchainHandler/createTemporaryKey'
import {
  lockAddresses,
  firstLockLocked,
} from '../../test-helpers/setupBlockchainHelpers'

describe('BlockchainHandler - createTemporaryKey', () => {
  const lock = firstLockLocked

  it("should create a temporary key based on the lock's expiration", () => {
    expect.assertions(2)

    const lockAddress = lockAddresses[0]
    const owner = '0xC0FFEE'
    const expectedExpiration = currentTimeInSeconds() + lock.expirationDuration
    const temporaryKey = createTemporaryKey(lockAddress, owner, lock)

    expect(temporaryKey).toEqual({
      owner,
      lock: lockAddress,
      expiration: expect.any(Number),
    })
    expect(temporaryKey.expiration).toBeCloseTo(expectedExpiration)
  })

  it('should create a temporary key based on the default value', () => {
    expect.assertions(2)

    const secondsInADay = 60 * 60 * 24
    const expectedExpiration = currentTimeInSeconds() + secondsInADay
    const lockAddress = lockAddresses[1]
    const owner = '0xDECADE'

    const temporaryKey = createTemporaryKey(lockAddress, owner, undefined)

    expect(temporaryKey).toEqual({
      owner,
      lock: lockAddress,
      expiration: expect.any(Number),
    })
    expect(temporaryKey.expiration).toBeCloseTo(expectedExpiration)
  })
})
