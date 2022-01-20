import { networkMapToFnResult } from '../../src/websub/helpers'

describe('Test networkMapFnResult', () => {
  it('should succeed', async () => {
    expect.assertions(1)
    expect.assertions(2)
    const map = await networkMapToFnResult((network) => {
      return network
    })

    expect(map.get(1)).toBe(1)
    expect(map.get(5)).toBe(undefined)
  })
})
