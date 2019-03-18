import {
  createLock,
  getLockByAddress,
  getLocksByOwner,
  updateLock,
} from '../../src/operations/lockOperations'

const Sequelize = require('sequelize')

const models = require('../../src/models')

let Lock = models.Lock
const Op = Sequelize.Op

beforeEach(() => {
  Lock = models.Lock // resetting Lock for before each test
})

describe('lockOperations', () => {
  describe('createLock', () => {
    it('should invoke Lock.create, with the checksummed adresses', async () => {
      expect.assertions(1)
      const name = 'My Lock'
      const address = '0x0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
      const owner = '0xca750f9232c1c38e34d27e77534e1631526ec99e'
      Lock.create = jest.fn(() => {})
      await createLock({
        name,
        address,
        owner,
      })
      expect(Lock.create).toHaveBeenCalledWith({
        name,
        address: '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5',
        owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
      })
    })
  })

  describe('getLockByAddress', () => {
    it('should invoke Lock.findOne with the checksummed lock address and return the lock object', async () => {
      expect.assertions(5)
      Lock.findOne = jest.fn(query => {
        expect(query.where.address[Op.eq]).toEqual(
          '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5'
        )
        return {
          name: 'My Lock',
          address: '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5',
          owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
        }
      })
      const lock = await getLockByAddress(
        '0x0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5'
      )
      expect(lock.name).toEqual('My Lock')
      expect(lock.address).toEqual(
        '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5'
      )
      expect(lock.owner).toEqual('0xCA750f9232C1c38e34D27e77534e1631526eC99e')
      expect(Lock.findOne).toHaveBeenCalled()
    })
  })

  describe('getLocksByOwner', () => {
    it('should invoke Lock.findOne with the checksummed lock address and return the lock object', async () => {
      expect.assertions(5)
      Lock.findAll = jest.fn(query => {
        expect(query.where.owner[Op.eq]).toEqual(
          '0xCA750f9232C1c38e34D27e77534e1631526eC99e'
        )
        return {
          name: 'My Lock',
          address: '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5',
          owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
        }
      })
      const lock = await getLocksByOwner(
        '0xca750f9232c1c38e34d27e77534e1631526ec99e'
      )
      expect(lock.name).toEqual('My Lock')
      expect(lock.address).toEqual(
        '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5'
      )
      expect(lock.owner).toEqual('0xCA750f9232C1c38e34D27e77534e1631526eC99e')
      expect(Lock.findAll).toHaveBeenCalled()
    })
  })

  describe('updateLock', () => {
    it('should call Lock.update with the right checksummed variables', async () => {
      expect.assertions(5)
      Lock.update = jest.fn((update, query) => {
        expect(update).toEqual({
          name: 'My Lock',
        })
        expect(query.where.address[Op.eq]).toEqual(
          '0x0X77Cc4F1FE4555f9b9E0d1E918caC211915b079e5'
        )
        expect(query.where.owner[Op.eq]).toEqual(
          '0xCA750f9232C1c38e34D27e77534e1631526eC99e'
        )
        expect(query.raw).toEqual(true)
      })
      updateLock({
        name: 'My Lock',
        address: '0x0x77cc4f1fe4555f9b9e0d1e918cac211915b079e5',
        owner: '0xca750f9232c1c38e34d27e77534e1631526ec99e',
      })
      expect(Lock.update).toHaveBeenCalledTimes(1)
    })
  })
})
