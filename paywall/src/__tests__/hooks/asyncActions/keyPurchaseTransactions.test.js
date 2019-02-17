import {
  sendNewKeyPurchaseTransaction,
  makeTransactionPoll,
  makeGetTransactionInfo,
} from '../../../hooks/asyncActions/keyPurchaseTransactions'

describe('useKeyPurchaseTransactions hook async helper generators', () => {
  describe('makeGetTransactionInfo', () => {
    let web3
    let transactionHash
    let newTransaction
    let startTransaction
    let mineTransaction
    let failTransaction
    let blockNumber
    let transaction
    let receipt

    beforeEach(() => {
      transactionHash = 'hash'
      transaction = {
        blockNumber: null,
      }
      receipt = {
        status: 'ok',
      }
      newTransaction = jest.fn()
      startTransaction = jest.fn()
      mineTransaction = jest.fn()
      failTransaction = jest.fn()
    })
    function mockMakeGetTransactionInfo() {
      web3 = {
        eth: {
          getBlockNumber: jest.fn(() => Promise.resolve(blockNumber)),
          getTransaction: jest.fn(() => Promise.resolve(transaction)),
          getTransactionReceipt: jest.fn(() => Promise.resolve(receipt)),
        },
      }
      return makeGetTransactionInfo({
        web3,
        transactionHash,
        newTransaction,
        startTransaction,
        mineTransaction,
        failTransaction,
      })
    }
    it('does nothing if transactionHash is not set', () => {
      transactionHash = undefined
      const getTransactionInfo = mockMakeGetTransactionInfo()

      getTransactionInfo()

      expect(web3.eth.getBlockNumber).not.toHaveBeenCalled()
      expect(web3.eth.getTransaction).not.toHaveBeenCalled()
    })
    it('does nothing if there is no transaction on the chain yet', async () => {
      transaction = undefined
      const getTransactionInfo = mockMakeGetTransactionInfo()

      await getTransactionInfo()

      expect(newTransaction).not.toHaveBeenCalled()
      expect(web3.eth.getTransaction).toHaveBeenCalledWith(transactionHash)
    })
    it.only('triggers startTransaction if there is a pending transaction, and transaction has a dummy block number set', async () => {
      const to = 'to'
      const input = 'input'
      const asOf = 1367482364
      const blockNumber = 342
      transaction = {
        to,
        input,
        blockNumber,
      }
      const getTransactionInfo = mockMakeGetTransactionInfo()

      await getTransactionInfo({ asOf })

      expect(startTransaction).toHaveBeenCalledWith(to, input, blockNumber)
    })
    it('triggers mineTransaction if the transaction has been mined', async () => {
      transaction = {
        blockNumber: 1,
      }
      blockNumber = 2
      const getTransactionInfo = mockMakeGetTransactionInfo()

      await getTransactionInfo({ asOf: 1 })

      expect(mineTransaction).toHaveBeenCalledWith(2)
    })
    it('gets the transaction receipt, and triggers failTransaction if it was rejected', async () => {
      transaction = {
        blockNumber: 1,
      }
      blockNumber = 2
      receipt = {
        status: '0x0',
      }
      const getTransactionInfo = mockMakeGetTransactionInfo()

      await getTransactionInfo({ asOf: 1 })

      expect(failTransaction).toHaveBeenCalled()
    })
  })
  describe('makeTransactionPoll', () => {
    let transaction
    let requiredConfirmations
    let getTransactionInfo
    function mockTransactionPoll(changes = {}) {
      return makeTransactionPoll({
        transaction,
        requiredConfirmations,
        getTransactionInfo,
        ...changes,
      })
    }

    beforeEach(() => {
      transaction = {
        status: 'mined',
        confirmations: 1,
      }
      requiredConfirmations = 5
      getTransactionInfo = jest.fn()
    })
    it('does not poll if transaction is not pending or mined', () => {
      const transactionPoll = mockTransactionPoll({
        transaction: { status: 'inactive' },
      })

      transactionPoll()

      expect(getTransactionInfo).not.toHaveBeenCalled()
    })
    it('transaction is confirmed, it does not poll', () => {
      const transactionPoll = mockTransactionPoll({
        transaction: {
          status: 'mined',
          confirmations: 20,
        },
      })

      transactionPoll()

      expect(getTransactionInfo).not.toHaveBeenCalled()
    })
    it('transaction is pending, it polls', () => {
      const transactionPoll = mockTransactionPoll({
        transaction: {
          status: 'pending',
          confirmations: 1,
        },
      })

      transactionPoll()

      expect(getTransactionInfo).toHaveBeenCalled()
    })
    it('transaction is mined but not fully confirmed, it polls', () => {
      const transactionPoll = mockTransactionPoll()

      transactionPoll()

      expect(getTransactionInfo).toHaveBeenCalled()
    })
  })
  describe('sendNewKeyPurchaseTransaction', () => {
    let wallet
    let once
    let on
    const to = 'to'
    const from = 'from'
    const data = 'data'
    const value = 'value'
    const gas = 'gas'
    let newTransaction
    let setHash
    let setError

    function mockCallSendNewKeyPurchaseTransaction(changes = {}) {
      sendNewKeyPurchaseTransaction({
        to,
        from,
        data,
        value,
        gas,
        wallet,
        newTransaction,
        setHash,
        setError,
        ...changes,
      })
    }
    beforeEach(() => {
      on = jest.fn()
      once = jest.fn(() => ({ on }))
      newTransaction = jest.fn()
      setHash = jest.fn()
      setError = jest.fn()
      wallet = {
        eth: {
          sendTransaction: jest.fn(() => ({
            once,
          })),
        },
      }
    })
    it('calls web3.eth.sendTransaction', () => {
      mockCallSendNewKeyPurchaseTransaction()

      expect(wallet.eth.sendTransaction).toHaveBeenCalledWith({
        to,
        from,
        value,
        data,
        gas,
      })
    })
    it('calls newTransaction', () => {
      mockCallSendNewKeyPurchaseTransaction()

      expect(newTransaction).toHaveBeenCalled()
    })
    it('calls setHash when transaction hash is available', () => {
      mockCallSendNewKeyPurchaseTransaction()
      const callSetHash = once.mock.calls[0][1]

      callSetHash('new hash')

      expect(setHash).toHaveBeenCalledWith('new hash')
    })
    it('calls setError when there is an error', () => {
      mockCallSendNewKeyPurchaseTransaction()
      const callSetError = on.mock.calls[0][1]

      callSetError('error')

      expect(setError).toHaveBeenCalledWith('error')
    })
  })
})
