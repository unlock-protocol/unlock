import {
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
  deletePaymentDetailsForAddress,
} from '../../src/operations/stripeOperations'

const Sequelize = require('sequelize')

const { Op } = Sequelize

const models = require('../../src/models')

let { UserReference, StripeCustomer } = models

beforeEach(() => {
  // resetting for before each test
  UserReference = models.UserReference
  StripeCustomer = models.StripeCustomer
})

describe('lockOperations', () => {
  describe('getStripeCustomerIdForAddress', () => {
    it('should get the data from StripeCustomer if it exists', async () => {
      expect.assertions(2)
      const stripeCustomerId = 'cus_customerId'

      StripeCustomer.findOne = jest.fn(() =>
        Promise.resolve({ StripeCustomerId: stripeCustomerId })
      )
      const publicKey = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      const result = await getStripeCustomerIdForAddress(publicKey)
      expect(StripeCustomer.findOne).toHaveBeenCalledWith({
        where: {
          publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        },
      })
      expect(result).toEqual(stripeCustomerId)
    })
  })

  describe('deletePaymentDetailsForAddress', () => {
    beforeEach(() => {
      StripeCustomer.destroy = jest.fn(() => Promise.resolve(0))
      UserReference.update = jest.fn(() => Promise.resolve([0]))
    })

    it('should delete data from StripeCustomer if it exists', async () => {
      expect.assertions(2)

      StripeCustomer.destroy = jest.fn(() => Promise.resolve(1))
      const publicKey = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      const result = await deletePaymentDetailsForAddress(publicKey)
      expect(StripeCustomer.destroy).toHaveBeenCalledWith({
        where: {
          publicKey: { [Op.eq]: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' },
        },
      })
      expect(result).toEqual(true)
    })

    it('should delete data from UserReference and StripeCustomer if it exists', async () => {
      expect.assertions(2)
      UserReference.update = jest.fn(() => Promise.resolve([1, 1]))
      const publicKey = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      const result = await deletePaymentDetailsForAddress(publicKey)
      expect(UserReference.update).toHaveBeenCalledWith(
        {
          stripe_customer_id: null,
        },
        {
          where: {
            publicKey: {
              [Op.eq]: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            },
          },
        }
      )
      expect(result).toEqual(true)
    })

    it('false if the data does not exist on any', async () => {
      expect.assertions(1)
      const publicKey = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      const result = await deletePaymentDetailsForAddress(publicKey)
      expect(result).toEqual(false)
    })
  })

  describe('saveStripeCustomerIdForAddress', () => {
    it('should store a stripeCustomer, normalized', async () => {
      expect.assertions(1)
      StripeCustomer.create = jest.fn(() => true)
      const publicKey = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      const stripeCustomerId = 'cus_customerId'
      await saveStripeCustomerIdForAddress(publicKey, stripeCustomerId)
      expect(StripeCustomer.create).toHaveBeenCalledWith({
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        StripeCustomerId: 'cus_customerId',
      })
    })
  })
})
