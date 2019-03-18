const request = require('supertest')
const app = require('../../src/app')
const Transaction = require('../../src/models').Transaction

describe('transactionController', () => {
  beforeEach(async () => {
    await Transaction.bulkCreate([
      {
        transactionHash: '0x345546565',
        sender: '0xcAFe',
        recipient: '0xbeefe',
      },
      {
        transactionHash: '0x445546565',
        sender: '0xcAFe',
        recipient: '0xbeefe',
      },
      {
        transactionHash: '0x545546565',
        sender: '0xcafe2',
        recipient: '0xbeefe',
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
        let response = await request(app)
          .get('/transactions')
          .query({ sender: '0xd489fF3' })
          .set('Accept', /json/)
        expect(response.body).toEqual({ transactions: [] })
      })
    })

    describe('when the address has transactions', () => {
      it("returns the addresses' transactions", async () => {
        expect.assertions(1)
        let sender = '0xcAFe'

        let response = await request(app)
          .get('/transactions')
          .query({ sender: sender })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(2)
      })
    })
  })

  describe('storing a transaction', () => {
    describe("when the transaction hasn't already been stored", () => {
      it('stores the provided transaction', async () => {
        expect.assertions(2)

        let response = await request(app)
          .post('/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0xsdbegjkbg,egf',
            sender: '0xSDgErGR',
            recipient: '0xSdaG433r',
          })

        let record = await Transaction.findOne({
          where: { sender: '0xSDgErGR', recipient: '0xSdaG433r' },
        })
        expect(record.sender).toBe('0xSDgErGR')
        expect(response.statusCode).toBe(202)
      })
    })

    describe('when the transaction already exists in storage', () => {
      it('returns an accepted status code', async () => {
        expect.assertions(1)
        let response = await request(app)
          .post('/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0x345546565',
            sender: '0xcAFe',
            recipient: '0xbeefe',
          })

        expect(response.statusCode).toBe(202)
      })
    })
  })
})
