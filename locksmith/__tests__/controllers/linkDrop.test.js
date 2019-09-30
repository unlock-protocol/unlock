const request = require('supertest')
const app = require('../../src/app')
const Transaction = require('../../src/models').Transaction

describe('transactionController', () => {
  beforeEach(async () => {
    await Transaction.bulkCreate([
      {
        transactionHash: '0x345546565',
        sender: '0xcAFe',
        recipient: '0xBeeFE',
      },
      {
        transactionHash: '0x445546565',
        sender: '0xcAFe',
        recipient: '0xBeeFE',
      },
      {
        transactionHash: '0x545546565',
        sender: '0xcAFe2',
        recipient: '0xBeeFE',
      },
      {
        transactionHash: '0x645546565',
        sender: '0xcAFe2',
        recipient: '0xBEefb',
      },
      {
        transactionHash: '0x645546567',
        sender: '0xcAFe2',
        recipient: '0xBEefb',
        for: '0xcAFe2',
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

        let transactionData =
          '0x00000000000000000000000006b5955a67d827cdf91823e3bb8f069e6c89c1d6000000000000000000000000000000000000000000000000016345785d8a0000'

        let response = await request(app)
          .post('/api/linkdrop/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0xsdbegjkbg,egf',
            sender: '0xSDgErGR',
            recipient: '0xSdaG433r',
            data: transactionData,
            for: '2223',
            chain: 42,
          })

        let record = await Transaction.findOne({
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
        let response = await request(app)
          .post('/api/linkdrop/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0x345546565',
            sender: '0xcAFe',
            recipient: '0xBeeFE',
          })

        expect(response.statusCode).toBe(202)
      })
    })
  })
})
