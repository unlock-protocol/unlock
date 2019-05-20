import { setAccount } from '../../../../data-iframe/blockchainHandler/account'
import { TRANSACTION_TYPES } from '../../../../constants'
import submittedListener from '../../../../data-iframe/blockchainHandler/purchaseKey/submittedListener'
import { setNetwork } from '../../../../data-iframe/blockchainHandler/network'

describe('submittedListener', () => {
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
      'submitted-lock-account': {
        hash: null,
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

    const result = await submittedListener({
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

    const result = await submittedListener({
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

    const result = await submittedListener({
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

    const result = await submittedListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKeys: keys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result.transactions).toBe(transactions)
    expect(result.keys).toBe(keys)
  })

  it('ignores transaction.pending for other transaction types', async done => {
    expect.assertions(2)

    setAccount('account')
    setNetwork(1)
    const existingTransactions = {}
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
        transactions: [],
        status: 'none',
        confirmations: 0,
      },
    }

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transactions, keys }) => {
      const submitted = {
        hash: null,
        from: 'account',
        to: 'lock',
        status: 'submitted',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'lock-account',
        lock: 'lock',
        confirmations: 0,
        network: 1,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }
      expect(transactions).toEqual({
        'submitted-lock-account': submitted,
      })

      expect(keys).toEqual({
        'lock-account': {
          ...existingKeys['lock-account'],
          status: 'submitted',
          transactions: [submitted],
        },
      })
      done()
    })

    fakeWalletService.handlers['transaction.pending']('not a key purchase')
    fakeWalletService.handlers['transaction.pending'](
      TRANSACTION_TYPES.KEY_PURCHASE
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

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKeys,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transactions, keys }) => {
      const submitted = {
        hash: null,
        from: 'account',
        to: 'lock',
        status: 'submitted',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'lock-account',
        lock: 'lock',
        confirmations: 0,
        network: 1,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }
      expect(transactions).toEqual({
        'submitted-lock-account': submitted,
        old,
      })

      expect(keys).toEqual({
        'lock-account': {
          ...existingKeys['lock-account'],
          status: 'submitted',
          transactions: [submitted, old],
        },
      })
      done()
    })

    fakeWalletService.handlers['transaction.pending'](
      TRANSACTION_TYPES.KEY_PURCHASE
    )
  })
})
