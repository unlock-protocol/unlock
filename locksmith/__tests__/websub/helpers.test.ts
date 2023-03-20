import { createSignature } from '../../src/websub/helpers'
import { describe, expect, it } from 'vitest'
describe('Test helpers', () => {
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
