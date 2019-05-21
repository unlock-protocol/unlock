import { setAccount } from '../../../../data-iframe/blockchainHandler/account'
import { TRANSACTION_TYPES } from '../../../../constants'
import pendingListener from '../../../../data-iframe/blockchainHandler/purchaseKey/submittedListener'
import { setNetwork } from '../../../../data-iframe/blockchainHandler/network'

describe('pendingListener', () => {
  let fakeWalletService

  beforeEach(() => {
    fakeWalletService = {
      handlers: {},
      once: (type, cb) => (fakeWalletService.handlers[type] = cb),
    }
  })

  it('returns immediately if the key is submitted', async () => {
    expect.assertions(2)

    setAccount('account')
    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: Number.MAX_SAFE_INTEGER,
        status: 'submitted',
      },
    }
    const keys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    const result = await pendingListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKeys: keys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.keys).toBe(keys)
  })

  it('returns immediately if the key is pending', async () => {
    expect.assertions(2)

    setAccount('account')
    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: Number.MAX_SAFE_INTEGER,
        status: 'pending',
      },
    }
    const keys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    const result = await pendingListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKeys: keys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.keys).toBe(keys)
  })

  it('returns immediately if the key is confirming', async () => {
    expect.assertions(2)

    setAccount('account')
    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: 123,
        status: 'mined',
      },
    }
    const keys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    const result = await pendingListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKeys: keys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.keys).toBe(keys)
  })

  it('returns immediately if the key is valid', async () => {
    expect.assertions(2)

    setAccount('account')
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
    const keys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    const result = await pendingListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKeys: keys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.keys).toBe(keys)
  })

  it('handles key with no transactions', async done => {
    expect.assertions(2)

    setAccount('account')
    setNetwork(1)

    const existingTransactions = {}
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 - 1000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    pendingListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transactions, keys }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        status: 'submitted',
        input: 'input',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'lock-account',
        lock: 'lock',
        confirmations: 0,
        network: 1,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }
      expect(transactions).toEqual({
        hash,
      })

      expect(keys).toEqual({
        'lock-account': {
          ...existingKeys['lock-account'],
          status: 'submitted',
          transactions: [hash],
        },
      })
      done()
    })

    fakeWalletService.handlers['transaction.new'](
      'hash' /* transaction hash */,
      'account' /* from */,
      'lock' /* to */,
      'input' /* input */,
      TRANSACTION_TYPES.KEY_PURCHASE /* type */,
      'submitted' /* status */
    )
  })

  it('handles expired key new transactions', async done => {
    expect.assertions(2)

    setAccount('account')
    setNetwork(1)
    const old = {
      hash: 'old',
      from: 'account',
      to: 'lock',
      status: 'mined',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 1345,
      network: 1,
      blockNumber: 123,
    }
    const existingTransactions = {
      old,
    }
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 - 1000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    pendingListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transactions, keys }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        status: 'submitted',
        input: 'input',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'lock-account',
        lock: 'lock',
        confirmations: 0,
        network: 1,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }
      expect(transactions).toEqual({
        hash,
        old,
      })

      expect(keys).toEqual({
        'lock-account': {
          ...existingKeys['lock-account'],
          status: 'submitted',
          transactions: [hash, old],
        },
      })
      done()
    })

    fakeWalletService.handlers['transaction.new'](
      'hash' /* transaction hash */,
      'account' /* from */,
      'lock' /* to */,
      'input' /* input */,
      TRANSACTION_TYPES.KEY_PURCHASE /* type */,
      'submitted'
    )
  })

  it('handles failed key new transactions', async done => {
    expect.assertions(2)

    setAccount('account')
    setNetwork(1)
    const old = {
      hash: 'old',
      from: 'account',
      to: 'lock',
      status: 'failed',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: 'lock-account',
      lock: 'lock',
      confirmations: 1345,
      network: 1,
      blockNumber: 123,
    }
    const existingTransactions = {
      old,
    }
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 - 1000,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    pendingListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transactions, keys }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        to: 'lock',
        status: 'submitted',
        input: 'input',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'lock-account',
        lock: 'lock',
        confirmations: 0,
        network: 1,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }
      expect(transactions).toEqual({
        hash,
        old,
      })

      expect(keys).toEqual({
        'lock-account': {
          ...existingKeys['lock-account'],
          status: 'submitted',
          transactions: [hash, old],
        },
      })
      done()
    })

    fakeWalletService.handlers['transaction.new'](
      'hash' /* transaction hash */,
      'account' /* from */,
      'lock' /* to */,
      'input' /* input */,
      TRANSACTION_TYPES.KEY_PURCHASE /* type */,
      'submitted'
    )
  })
})
