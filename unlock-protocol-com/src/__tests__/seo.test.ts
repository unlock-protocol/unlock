import { describe, expect } from 'vitest'
import { customizeSEO } from '../config/seo'
describe('Test customizeSEO', () => {
  const seo = customizeSEO({
    title: 'test',
    imagePath: '/image/test',
  })
  // relative paths will throw
  expect(() => new URL(seo.openGraph.images[0].url)).not.toThrow()
})
