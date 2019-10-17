import {
  PaywallStatus,
  getPaywallStatus,
  isUnexpired,
} from '../../../data-iframe/Mailbox'
import { currentTimeInSeconds } from '../../../utils/durations'
import { lockAddresses } from '../../test-helpers/setupBlockchainHelpers'

const thePast = currentTimeInSeconds() - 1
const theFuture = currentTimeInSeconds() + 2000
const account = '0xC0FFEE'

const makeKeyResult = (expiration: number) => ({
  expiration,
  lock: 'a lock',
  owner: 'me',
})

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

describe('Mailbox - getPaywallState', () => {
  it('should return PaywallStatus.none when there are no lock addresses', () => {
    expect.assertions(1)

    expect(getPaywallStatus(unexpiredKeysData, [])).toBe(PaywallStatus.none)
  })

  it('should return PaywallStatus.none when we do not have all keys from chain, and there are no valid keys', () => {
    expect.assertions(2)

    expect(getPaywallStatus(notEnoughKeysData, lockAddresses)).toBe(
      PaywallStatus.none
    )
    expect(getPaywallStatus(fakeKeysData, lockAddresses)).toBe(
      PaywallStatus.none
    )
  })

  it('should return PaywallStatus.locked when no keys are valid', () => {
    expect.assertions(1)

    expect(getPaywallStatus(allKeysExpiredData, lockAddresses)).toBe(
      PaywallStatus.locked
    )
  })

  it('should return PaywallStatus.unlocked when there is a valid key (do not have all data)', () => {
    expect.assertions(1)

    expect(getPaywallStatus(oneValidKeyData, lockAddresses)).toBe(
      PaywallStatus.unlocked
    )
  })

  it('should return PaywallStatus.unlocked when there is a valid key (have all data)', () => {
    expect.assertions(1)

    expect(getPaywallStatus(unexpiredKeysData, lockAddresses)).toBe(
      PaywallStatus.unlocked
    )
  })

  describe('isUnexpired', () => {
    it.each([[-1, false], [0, false], [thePast, false], [theFuture, true]])(
      'isUnexpired(%s) should be %s',
      (expiration, result) => {
        expect.assertions(1)
        expect(isUnexpired(makeKeyResult(expiration as number))).toBe(result)
      }
    )
  })
})
