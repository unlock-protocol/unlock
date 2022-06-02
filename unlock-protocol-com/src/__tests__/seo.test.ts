import { describe, expect, it } from 'vitest'
import { customizeSEO } from '../config/seo'

describe('Test customizeSEO', () => {
  it('should have openGraph urls', () => {
    expect.assertions(1)
    const seo = customizeSEO({
      title: 'test',
      imagePath: '/image/test',
    })
    // relative paths will throw
    expect(() => new URL(seo.openGraph.images[0].url)).not.toThrow()
  })
})
