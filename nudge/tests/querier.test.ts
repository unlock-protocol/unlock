import { Querier } from '../src/querier'

let query = jest
  .fn()
  .mockResolvedValueOnce({
    data: {
      keys: [],
    },
  })
  .mockResolvedValueOnce({
    data: {
      keys: [
        {
          keyId: '2',
          lock: { address: '0xabc' },
        },
      ],
    },
  })

jest.mock('apollo-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      query,
    }
  })
})

describe('query', () => {
  describe('when the query returns no results', () => {
    it('returns an empty collection', async () => {
      expect.assertions(1)
      expect(await new Querier('http://example.com').query()).toEqual([])
    })
  })

  describe('when the query returns results', () => {
    it('returns a collection of results', async () => {
      expect.assertions(1)
      expect(await new Querier('http://example.com').query()).toEqual([
        {
          lockAddress: '0xabc',
          keyId: '2',
        },
      ])
    })
  })
})
