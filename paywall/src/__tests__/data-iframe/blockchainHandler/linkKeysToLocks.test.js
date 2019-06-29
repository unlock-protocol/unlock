import linkKeysToLocks from '../../../data-iframe/blockchainHandler/linkKeysToLocks'

describe('linkKeysToLocks', () => {
  it('links keys to the locks they unlock', async () => {
    expect.assertions(1)

    const locks = {
      '0x123': {
        address: '0x123',
        keyPrice: '5',
        expirationDuration: '6',
        maxNumberOfKeys: 4,
      },
      '0x456': {
        address: '0x456',
        keyPrice: '55',
        expirationDuration: '66',
        maxNumberOfKeys: 44,
      },
    }

    const keys = {
      '0x123': {
        id: 'whatever0x123',
        lock: '0x123',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 123,
      },
      '0x456': {
        id: 'whatever0x456',
        lock: '0x456',
        owner: 'account',
        expiration: 0,
      },
    }

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        for: 'account',
        to: '0x123',
        key: '0x123-account',
        lock: '0x123',
        status: 'mined',
        confirmations: 2,
        blockNumber: 5,
      },
      old: {
        hash: 'old',
        from: 'another account',
        for: 'account',
        to: '0x123',
        key: '0x123-account',
        lock: '0x123',
        status: 'mined',
        confirmations: 223,
        blockNumber: 4,
      },
    }

    const newLocks = await linkKeysToLocks({
      locks,
      keys,
      transactions,
      requiredConfirmations: 3,
    })

    expect(newLocks).toEqual({
      '0x123': {
        ...locks['0x123'],
        key: {
          confirmations: 2,
          expiration: keys['0x123'].expiration,
          id: 'whatever0x123',
          lock: '0x123',
          owner: 'account',
          status: 'confirming',
          transactions: [transactions.hash, transactions.old],
        },
      },
      '0x456': {
        ...locks['0x456'],
        key: {
          confirmations: 0,
          expiration: 0,
          id: 'whatever0x456',
          lock: '0x456',
          owner: 'account',
          status: 'none',
          transactions: [],
        },
      },
    })
  })
})
