import { Processor } from '../src/processor'

let testGraphQLEndpoint = 'http://example.com/graphQL'

let queryResults = jest
  .fn()
  .mockResolvedValueOnce([])
  .mockResolvedValueOnce([
    {
      lockAddress: '0xdef',
      keyId: '1',
    },
  ])
  .mockResolvedValue([
    {
      keyId: '1',
      lockAddress: '0xabc',
    },
  ])

jest.mock('../src/querier', () => {
  return {
    Querier: jest.fn().mockImplementation(() => {
      return { query: queryResults }
    }),
  }
})

jest.mock('../src/emailList', () => {
  return {
    extractEmails: jest.fn(input => {
      return input.map((key: { lockAddress: any; keyId: any }) => {
        return {
          lockAddress: key.lockAddress,
          keyId: key.keyId,
          emailAddress: 'test@email.com',
        }
      })
    }),
  }
})

jest.mock('../src/dispatcher', () => {
  return {
    check: jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false),
    dispatch: jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false),
    record: jest.fn().mockReturnValueOnce(true),
  }
})

describe('processKey', () => {
  describe('when an email has been previously dispatched', () => {
    it('does not dispatch an email', async () => {
      expect(
        await new Processor(testGraphQLEndpoint).processKey({
          lockAddress: '0xabc',
          keyId: '1',
          emailAddress: 'test@example.com',
          lockName: 'Lock Name'
        })
      ).toBe(false)
    })
  })
  describe('when an email has not been dispatched', () => {
    describe('when dispatch successful', () => {
      it('returns true', async () => {
        expect(
          await new Processor(testGraphQLEndpoint).processKey({
            lockAddress: '0xabc',
            keyId: '2',
            emailAddress: 'test@example.com',
            lockName: 'Lock Name'
          })
        ).toBe(true)
      })
    })
    describe('when dispatch unsuccessful', () => {
      it('returns true', async () => {
        expect(
          await new Processor(testGraphQLEndpoint).processKey({
            lockAddress: '0xabc',
            keyId: '2',
            emailAddress: 'test@example.com',
          })
        ).toBe(false)
      })
    })
  })
})
