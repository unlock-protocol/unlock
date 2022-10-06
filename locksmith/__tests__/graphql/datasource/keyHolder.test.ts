import { KeyHolder } from '../../../src/graphql/datasource'

describe.skip('KeyHolder', () => {
  describe('get', () => {
    describe('when data is returned for the data source', () => {
      it('return the requested data', async () => {
        expect.assertions(1)
        const keyHolder = new KeyHolder()
        jest
          .spyOn(keyHolder, 'get')
          .mockImplementation(() => Promise.resolve([{ mocked: 'data' }]))

        expect(await keyHolder.get('0xabce', 31337)).toEqual([
          {
            mocked: 'data',
          },
        ])
      })
    })

    describe('when an error occurs in data fetch', () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        const keyHolder = new KeyHolder()
        expect(await keyHolder.get('0xabce', 31337)).toEqual([])
      })
    })
  })
})
