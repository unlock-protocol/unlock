import { gotAllKeysFromChain } from '../../../data-iframe/Mailbox'
import { lockAddresses } from '../../test-helpers/setupBlockchainHelpers'

const account = '0xC0FFEE'

const notEnoughKeysData = {}

const invalidKeysData = {
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

const validKeysData = {
  [lockAddresses[0]]: {
    expiration: 1,
    lock: lockAddresses[0],
    owner: account,
  },
  [lockAddresses[1]]: {
    expiration: 5321,
    lock: lockAddresses[1],
    owner: account,
  },
  [lockAddresses[2]]: {
    expiration: 0,
    lock: lockAddresses[2],
    owner: account,
  },
}

describe('Mailbox - gotAllKeysFromChain', () => {
  it('should return false when there are no locks in the paywall config', () => {
    expect.assertions(1)

    const result = gotAllKeysFromChain(validKeysData, [])

    expect(result).toBeFalsy()
  })

  it('should return false when there is not a key for each lock', () => {
    expect.assertions(1)

    const result = gotAllKeysFromChain(notEnoughKeysData, lockAddresses)

    expect(result).toBeFalsy()
  })

  it('should return false if any of the keys are fake', () => {
    expect.assertions(1)

    const result = gotAllKeysFromChain(invalidKeysData, lockAddresses)

    expect(result).toBeFalsy()
  })

  it('should return true if all keys are real and all locks have a key', () => {
    expect.assertions(1)

    const result = gotAllKeysFromChain(validKeysData, lockAddresses)

    expect(result).toBeTruthy()
  })
})
