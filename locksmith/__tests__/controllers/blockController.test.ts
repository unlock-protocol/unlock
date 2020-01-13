import nock = require('nock')
import app = require('../../src/app')
const request = require('supertest')
const { Block } = require('../../src/models')

nock.back.fixtures = `${__dirname}/fixtures/blockController`
nock.disableNetConnect()

beforeAll(async () => {
  await Block.truncate()
})

const blockNumber = 3346773

describe('blockGet', () => {
  describe('when a valid chain id is provided', () => {
    it('returns the block timestamp and persists the value', async () => {
      expect.assertions(2)
      await nock.back('valid_chain.json')
      const response = await request(app)
        .get(`/block/${blockNumber}`)
        .query({ chain: 3 })

      expect(response.statusCode).toBe(200)
      expect(
        await Block.findOne({ where: { number: 3346773, chain: 3 } })
      ).not.toBeNull()
    })
  })

  describe('when no chain id is provided', () => {
    it('assumes the main net', async () => {
      expect.assertions(2)
      await nock.back('no_chain.json')

      const response = await request(app).get(`/block/${blockNumber}`)
      expect(response.statusCode).toBe(200)
      expect(
        await Block.findOne({ where: { number: 3346773, chain: 1 } })
      ).not.toBeNull()
    })
  })

  describe('when an invalid chain id is provided', () => {
    it('raises an error', async () => {
      expect.assertions(1)
      await nock.back('invalid.json')

      const response = await request(app)
        .get(`/block/${blockNumber}`)
        .query({ chain: 'dfodfvdf' })
      expect(response.statusCode).toBe(400)
    })
  })
})
