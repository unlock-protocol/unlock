import { TRANSACTION_TYPES } from '../../../../constants'
import submittedListener from '../../../../data-iframe/blockchainHandler/purchaseKey/submittedListener'
import { setNetwork } from '../../../../data-iframe/blockchainHandler/network'

describe('submittedListener', () => {
  let fakeWalletService
  let fakeWeb3Service
  let newKey

  beforeEach(() => {
    fakeWalletService = {
      handlers: {},
      on: (type, cb) => (fakeWalletService.handlers[type] = cb),
      once: (type, cb) => (fakeWalletService.handlers[type] = cb),
      off: type => delete fakeWalletService.handlers[type],
    }
    fakeWeb3Service = {
      getKeyByLockForOwner: jest.fn(() => newKey),
    }
  })

  it('returns immediately if the key is submitted', async () => {
    expect.assertions(1)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        for: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: Number.MAX_SAFE_INTEGER,
        status: 'submitted',
      },
    }
    const key = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }

    const result = await submittedListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      walletService: fakeWalletService,
      web3Service: fakeWeb3Service,
      requiredConfirmations: 3,
    })

    expect(result).toBe(false)
  })

  it('returns immediately if the key is pending', async () => {
    expect.assertions(1)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        for: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: Number.MAX_SAFE_INTEGER,
        status: 'pending',
      },
    }
    const key = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }

    const result = await submittedListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result).toBe(false)
  })

  it('returns immediately if the key is confirming', async () => {
    expect.assertions(1)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        for: 'account',
        to: 'lock',
        key: 'lock-account',
        lock: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
        blockNumber: 123,
        status: 'mined',
      },
    }
    const key = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }
    newKey = key

    const result = await submittedListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result).toBe(false)
  })

  it('returns immediately if the key is valid', async () => {
    expect.assertions(1)

    const transactions = {
      hash: {
        hash: 'hash',
        from: 'account',
        for: 'account',
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
      expiration: new Date().getTime() / 1000 + 10000,
    }
    newKey = key

    const result = await submittedListener({
      lockAddress: 'lock',
      existingTransactions: transactions,
      existingKey: key,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    })

    expect(result).toBe(false)
  })

  it('handles key with no transactions', async done => {
    expect.assertions(2)

    setNetwork(1)

    const existingTransactions = {}
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 - 1000,
    }
    newKey = existingKey

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transaction, key }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        for: 'account',
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
      expect(transaction).toEqual(hash)

      expect(key).toEqual(existingKey)
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

    setNetwork(1)
    const old = {
      hash: 'old',
      from: 'account',
      for: 'account',
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
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 - 1000,
    }
    newKey = existingKey

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transaction, key }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        for: 'account',
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
      expect(transaction).toEqual(hash)

      expect(key).toEqual(existingKey)
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

    setNetwork(1)
    const old = {
      hash: 'old',
      from: 'account',
      for: 'account',
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
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 - 1000,
    }
    newKey = existingKey

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).then(({ transaction, key }) => {
      const hash = {
        hash: 'hash',
        from: 'account',
        for: 'account',
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
      expect(transaction).toEqual(hash)

      expect(key).toEqual(existingKey)
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

  it('throws on failed transaction', async done => {
    expect.assertions(1)

    setNetwork(1)
    const old = {
      hash: 'old',
      from: 'account',
      for: 'account',
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
    const existingKey = {
      id: 'lock-account',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 - 1000,
    }
    newKey = existingKey

    submittedListener({
      lockAddress: 'lock',
      existingTransactions,
      existingKey,
      web3Service: fakeWeb3Service,
      walletService: fakeWalletService,
      requiredConfirmations: 3,
    }).catch(e => {
      expect(e).toBeInstanceOf(Error)
      done()
    })

    fakeWalletService.handlers.error(new Error('fail'))
  })
})
