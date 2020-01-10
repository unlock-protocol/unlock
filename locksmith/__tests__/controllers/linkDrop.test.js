const request = require('supertest')
const app = require('../../src/app')
const { Transaction } = require('../../src/models')

describe('transactionController', () => {
  beforeEach(async () => {
    await Transaction.truncate()
    await Transaction.bulkCreate([
      {
        transactionHash: '0x345546567',
        sender: '0xcAFe',
        recipient: '0xBeeFE',
      },
    ])
  })

  afterEach(async () => {
    await Transaction.truncate()
  })
  describe('storing a transaction', () => {
    describe("when the transaction hasn't already been stored", () => {
      it('stores the provided transaction', async () => {
        expect.assertions(3)

        const transactionData =
          '0x00000000000000000000000006b5955a67d827cdf91823e3bb8f069e6c89c1d6000000000000000000000000000000000000000000000000016345785d8a0000'

        const response = await request(app)
          .post('/api/linkdrop/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0xsdbegjkbg,egfzz',
            sender: '0xSDgErGR',
            recipient: '0xSdaG433r',
            data: transactionData,
            for: '2223',
            chain: 42,
          })

        const record = await Transaction.findOne({
          where: { sender: '0xSDgErGR', recipient: '0xSdaG433r', chain: 42 },
        })
        expect(record.sender).toBe('0xSDgErGR')
        expect(record.data).toEqual(transactionData)
        expect(response.statusCode).toBe(202)
      })
    })

    describe('when the transaction already exists in storage', () => {
      it('returns an accepted status code', async () => {
        expect.assertions(1)
        const response = await request(app)
          .post('/api/linkdrop/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0x345546567',
            sender: '0xcAFe',
            recipient: '0xBeeFE',
          })

        expect(response.statusCode).toBe(202)
      })
    })
  })
})
