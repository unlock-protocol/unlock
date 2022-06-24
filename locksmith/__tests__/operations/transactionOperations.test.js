import {
  findOrCreateTransaction,
  getTransactionsByFilter,
} from '../../src/operations/transactionOperations'

const Sequelize = require('sequelize')

const models = require('../../src/models')

let { Transaction } = models
const { Op } = Sequelize

beforeEach(() => {
  Transaction = models.Transaction // resetting Lock for before each test
})

describe('lockOperations', () => {
  describe('findOrCreateTransaction', () => {
    it('should call findOrCreate on the transaction object', async () => {
      expect.assertions(6)
      const transactionHash =
        '0x7d6289db59c3434b6a034b4f211be52ca34f05e2aa856fc3e69b8af101355842'
      const sender = '0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
      const recipient = '0xca750f9232c1c38e34d27e77534e1631526ec99e'
      const chain = 31337
      Transaction.findOrCreate = jest.fn((query) => {
        expect(query.where).toEqual({
          transactionHash,
        })
        expect(query.defaults.transactionHash).toEqual(transactionHash)
        expect(query.defaults.sender).toEqual(
          '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5'
        )
        expect(query.defaults.recipient).toEqual(
          '0xCA750f9232C1c38e34D27e77534e1631526eC99e'
        )

        expect(query.defaults.chain).toEqual(31337)
      })
      await findOrCreateTransaction({
        transactionHash,
        sender,
        recipient,
        chain,
      })
      expect(Transaction.findOrCreate).toHaveBeenCalled()
    })
  })

  describe('getTransactionsByFilter', () => {
    it('should get the list of transactions by that sender after having checksummed the address', async () => {
      expect.assertions(2)
      const sender = '0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
      Transaction.findAll = jest.fn((query) => {
        expect(query.where.sender[Op.eq]).toEqual(
          '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5'
        )
      })
      await getTransactionsByFilter({ sender })
      expect(Transaction.findAll).toHaveBeenCalled()
    })

    describe('when passed a recipient filter', () => {
      it('only returns transactions for the appropriate recipient', async () => {
        expect.assertions(2)
        const sender = '0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
        Transaction.findAll = jest.fn((query) => {
          expect(query.where.sender[Op.eq]).toEqual(
            '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5'
          )
        })
        await getTransactionsByFilter({
          sender,
          recipient: ['0xCA750f9232C1c38e34D27e77534e1631526eC99e'],
        })
        expect(Transaction.findAll).toHaveBeenCalledWith({
          where: {
            recipient: {
              [Op.in]: ['0xCA750f9232C1c38e34D27e77534e1631526eC99e'],
            },
            sender: { [Op.eq]: '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5' },
          },
        })
      })
    })

    describe('when passed a createdAfter value', () => {
      it('should only return transactions created after that date', async () => {
        expect.assertions(1)
        const sender = '0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
        const timestamp = 1573742842379
        Transaction.findAll = jest.fn(() => {})
        await getTransactionsByFilter({
          sender,
          recipient: ['0xCA750f9232C1c38e34D27e77534e1631526eC99e'],
          createdAfter: timestamp,
        })
        expect(Transaction.findAll).toHaveBeenCalledWith({
          where: {
            recipient: {
              [Op.in]: ['0xCA750f9232C1c38e34D27e77534e1631526eC99e'],
            },
            sender: { [Op.eq]: '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5' },
            createdAt: {
              [Op.gte]: new Date(timestamp),
            },
          },
        })
      })
    })
  })
})
