import Transaction from '../../src/handler/transaction'
import { Registry } from '../../src/registry'

describe('getTransactionData', () => {
  it('requests transaction details from the provider', () => {
    expect.assertions(1)
    let provider = {
      getTransaction: jest.fn(),
    }

    let transactionHash

    Transaction.getTransactionData(provider, transactionHash)
    expect(provider.getTransaction).toHaveBeenCalled()
  })
})

describe('filterTransaction', () => {
  describe('when the transction to address is included in the registry', () => {
    it('returns true', async () => {
      expect.assertions(1)
      Registry.get = jest.fn().mockResolvedValue(['0xabc'])

      let transaction = { to: '0xabc' }
      let connection

      expect(await Transaction.filterTransaction(transaction, connection)).toBe(
        true
      )
    })
  })

  describe('when the transaction from address is included in the registry', () => {
    it('returns true', async () => {
      expect.assertions(1)
      Registry.get = jest.fn().mockResolvedValue(['0xabc'])

      let transaction = { from: '0xabc' }
      let connection

      expect(await Transaction.filterTransaction(transaction, connection)).toBe(
        true
      )
    })
  })

  describe('when the sender and recipient are not included in the trasnaction', () => {
    it('returns false', async () => {
      expect.assertions(1)
      Registry.get = jest.fn().mockResolvedValue(['0xabc'])
      let transaction = { to: '0xbbb' }
      let connection

      expect(await Transaction.filterTransaction(transaction, connection)).toBe(
        false
      )
    })
  })
})

describe('transactionHandler', () => {
  describe('when the transaction hash exists', () => {
    describe('when the transaction is relevant', () => {
      it('stores the transaction ', async () => {
        expect.assertions(1)
        Transaction.getTransactionData = jest
          .fn()
          .mockResolvedValue({ to: '0xabc' })
        Registry.get = jest.fn().mockResolvedValue(['0xabc'])

        let storage = {
          storeTransaction: jest.fn(),
        }

        let connection
        let transactionHash

        let provider = {
          getTransaction: jest.fn(),
        }

        await Transaction.transactionHandler(
          storage,
          connection,
          transactionHash,
          provider
        )

        expect(storage.storeTransaction).toHaveBeenCalled()
      })
    })

    describe('when the transaction is irrelevant', () => {
      it('does not store the transaction', async () => {
        expect.assertions(1)
        Transaction.getTransactionData = jest
          .fn()
          .mockResolvedValue({ to: '0xabc' })
        Registry.get = jest.fn().mockResolvedValue(['0xcdef'])

        let storage = {
          storeTransaction: jest.fn(),
        }

        let connection
        let transactionHash

        let provider = {
          getTransaction: jest.fn(),
        }

        await Transaction.transactionHandler(
          storage,
          connection,
          transactionHash,
          provider
        )

        expect(storage.storeTransaction).not.toHaveBeenCalled()
      })
    })
  })
})
