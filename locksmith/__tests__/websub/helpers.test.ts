import { networkMapToFnResult, createSignature } from '../../src/websub/helpers'

describe('Test helpers', () => {
  it('networkMapFnResult', async () => {
    expect.assertions(1)
    expect.assertions(2)
    const map = await networkMapToFnResult((network) => {
      return network
    })

    expect(map.get(1)).toBe(1)
    expect(map.get(5)).toBe(undefined)
  })

  it('Create signature test', () => {
    expect.assertions(1)

    const sig1 = createSignature({
      secret: 'secret',
      content: 'content',
      algorithm: 'sha256',
    })

    const sig2 = createSignature({
      secret: 'secret',
      content: 'content',
      algorithm: 'sha256',
    })

    expect(sig1).toBe(sig2)
  })
})
