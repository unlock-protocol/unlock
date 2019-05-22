import { TRANSACTION_TYPES } from '../../../../constants'
import updateListener from '../../../../data-iframe/blockchainHandler/purchaseKey/updateListener'

describe('updateListener', () => {
  let fakeWeb3Service

  beforeEach(() => {
    fakeWeb3Service = {
      handlers: {},
      on: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
      once: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
      off: type => delete fakeWeb3Service.handlers[type],
    }
  })
  it('ignores transactions that are not in process', async () => {
    expect.assertions(2)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 5,
        blockNumber: 123,
        status: 'mined',
      },
    }
    const key = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: 0,
      transactions: [],
      status: 'none',
      confirmations: 0,
    }

    const result = await updateListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.key).toBe(key)
  })

  it('ignores confirmed transactions', async () => {
    expect.assertions(2)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 5,
        blockNumber: 123,
        status: 'mined',
      },
    }
    const key = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 1000,
      transactions: [],
      status: 'none',
      confirmations: 0,
    }

    const result = await updateListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.key).toBe(key)
  })

  it('gets a transaction update for submitted transactions', async done => {
    expect.assertions(2)

    const hash = {
      hash: 'hash',
      from: 'account',
      to: 'lock',
      status: 'submitted',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER,
    }
    const existingTransactions = {
      hash,
    }
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 1000,
      transactions: [],
      status: 'none',
      confirmations: 0,
    }

    updateListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    }).then(({ transactions, key }) => {
      const newHash = {
        ...hash,
        status: 'pending',
        thing: 'hi',
      }
      expect(transactions).toEqual({
        hash: newHash,
      })

      expect(key).toEqual({
        ...existingKey,
        status: 'pending',
        transactions: [newHash],
      })
      done()
    })

    fakeWeb3Service.handlers['transaction.updated'](
      'hash' /* transaction hash */,
      { thing: 'hi', status: 'pending' }
    )
  })

  it('gets a transaction update for pending transactions', async done => {
    expect.assertions(2)

    const hash = {
      hash: 'hash',
      from: 'account',
      to: 'lock',
      status: 'pending',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER,
    }
    const existingTransactions = {
      hash,
    }
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 1000,
      transactions: [],
      status: 'none',
      confirmations: 0,
    }

    updateListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    }).then(({ transactions, key }) => {
      const newHash = {
        ...hash,
        status: 'mined',
        thing: 'hi',
        blockNumber: 1234,
      }
      expect(transactions).toEqual({
        hash: newHash,
      })

      expect(key).toEqual({
        ...existingKey,
        status: 'confirming',
        transactions: [newHash],
      })
      done()
    })

    fakeWeb3Service.handlers['transaction.updated'](
      'hash' /* transaction hash */,
      { thing: 'hi', status: 'mined', blockNumber: 1234 }
    )
  })

  it('gets a transaction update for mined transactions', async done => {
    expect.assertions(2)

    const hash = {
      hash: 'hash',
      from: 'account',
      to: 'lock',
      status: 'mined',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 0,
      blockNumber: 1234,
    }
    const existingTransactions = {
      hash,
    }
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 1000,
      transactions: [],
      status: 'none',
      confirmations: 0,
    }

    updateListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    }).then(({ transactions, key }) => {
      const newHash = {
        ...hash,
        confirmations: 1,
        thing: 'hi',
      }
      expect(transactions).toEqual({
        hash: newHash,
      })

      expect(key).toEqual({
        ...existingKey,
        status: 'confirming',
        confirmations: 1,
        transactions: [newHash],
      })
      done()
    })

    fakeWeb3Service.handlers['transaction.updated'](
      'hash' /* transaction hash */,
      { thing: 'hi', confirmations: 1 }
    )
  })

  it('throws on transaction failure', async done => {
    expect.assertions(1)

    const hash = {
      hash: 'hash',
      from: 'account',
      to: 'lock',
      status: 'mined',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 0,
      blockNumber: 1234,
    }
    const existingTransactions = {
      hash,
    }
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 1000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    updateListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    }).catch(e => {
      expect(e).toBeInstanceOf(Error)
      done()
    })

    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (fakeWeb3Service.handlers.error) {
          clearInterval(interval)
          resolve()
        }
      })
    })

    fakeWeb3Service.handlers.error(new Error('fail'))
  })
})
