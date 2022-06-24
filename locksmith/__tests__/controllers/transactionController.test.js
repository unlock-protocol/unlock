const request = require('supertest')
const app = require('../../src/app')
const { Transaction } = require('../../src/models')

describe('transactionController', () => {
  beforeEach(async () => {
    await Transaction.truncate()
    await Transaction.bulkCreate([
      {
        transactionHash: '0x345546565',
        sender: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
        recipient: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      },
      {
        transactionHash: '0x445546565',
        sender: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
        recipient: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
      },
      {
        transactionHash: '0x545546565',
        sender: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
        recipient: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
      },
      {
        transactionHash: '0x645546565',
        sender: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
        recipient: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
      },
      {
        transactionHash: '0x645546567',
        sender: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
        recipient: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
        for: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
      },
    ])
  })

  afterEach(async () => {
    await Transaction.truncate()
  })

  describe('retrieving transactions for a user', () => {
    describe('when the address has 0 transactions', () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        const response = await request(app)
          .get('/transactions')
          .query({ sender: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc' })
          .set('Accept', /json/)
        expect(response.body).toEqual({ transactions: [] })
      })
    })

    describe('when the address has transactions', () => {
      it("returns the addresses' transactions", async () => {
        expect.assertions(1)
        const sender = '0xdd2fd4581271e230360230f9337d5c0430bf44c0'

        const response = await request(app)
          .get('/transactions')
          .query({ sender })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(2)
      })
    })

    describe('when the address has transactions to the recipient', () => {
      it("returns the addresses' transactions", async () => {
        expect.assertions(1)
        const sender = '0xcd3b766ccdd6ae721141f452c550ca635964ce71'

        const response = await request(app)
          .get('/transactions')
          .query({
            sender,
            recipient: [
              '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
              '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
            ],
          })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(1)
      })
    })

    describe('when filtering on for', () => {
      it("returns the addresses' transactions", async () => {
        expect.assertions(2)
        const sender = '0xcd3B766CCDd6AE721141F452C550Ca635964ce71'

        const response = await request(app)
          .get('/transactions')
          .query({
            sender,
            for: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
          })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(1)
        expect(response.body.transactions[0].transactionHash).toEqual(
          '0x645546567'
        )
      })
    })

    describe('when filtering on for -> recipients', () => {
      it('returns the matching transactions', async () => {
        expect.assertions(2)
        const response = await request(app)
          .get('/transactions')
          .query({
            recipient: [
              '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
              '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
            ],
            for: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
          })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(1)
        expect(response.body.transactions[0].transactionHash).toEqual(
          '0x645546567'
        )
      })
    })
  })

  describe('storing a transaction', () => {
    describe("when the transaction hasn't already been stored", () => {
      it('stores the provided transaction', async () => {
        expect.assertions(3)

        const transactionData =
          '0x00000000000000000000000006b5955a67d827cdf91823e3bb8f069e6c89c1d6000000000000000000000000000000000000000000000000016345785d8a0000'

        const response = await request(app)
          .post('/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0xsdbegjkbg,egf',
            sender: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
            recipient: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
            data: transactionData,
            chain: 42,
          })

        const record = await Transaction.findOne({
          where: {
            sender: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
            recipient: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
            chain: 42,
          },
        })
        expect(record.sender).toBe('0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec')
        expect(record.data).toEqual(transactionData)
        expect(response.statusCode).toBe(202)
      })
    })

    describe('when the transaction already exists in storage', () => {
      it('returns an accepted status code', async () => {
        expect.assertions(1)
        const response = await request(app)
          .post('/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0x345546565',
            sender: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
            recipient: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
          })

        expect(response.statusCode).toBe(202)
      })
    })
  })

  describe('getting the odds of success of a transaction', () => {
    it('returns a json object with the willSucceed property', async () => {
      expect.assertions(2)
      const response = await request(app)
        .get('/transaction/0x345546565/odds')
        .set('Accept', /json/)
      expect(response.statusCode).toBe(200)
      expect(response.body.willSucceed).toBe(1) // default until we implement things
    })
  })
})
