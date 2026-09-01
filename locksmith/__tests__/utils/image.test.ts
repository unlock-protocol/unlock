import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

vi.mock('../../src/utils/lockIcon', () => ({
  default: {
    lockIcon: () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
  },
}))

const { imageURLToDataURI } = await import('../../src/utils/image')

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('imageURLToDataURI', () => {
  it('fetches public https images', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      headers: { get: () => 'image/png' },
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    }) as unknown as typeof fetch

    const dataUri = await imageURLToDataURI('https://example.com/lock.png')
    expect(dataUri).toContain('data:image/png;base64,')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com/lock.png'),
      expect.objectContaining({ redirect: 'error' })
    )
  })

  it('rejects private/link-local URLs and uses fallback', async () => {
    global.fetch = vi.fn()
    const fallback = 'data:image/svg+xml;base64,ZmFrZQ=='
    const result = await imageURLToDataURI(
      'http://127.0.0.1/secret.png',
      fallback
    )
    expect(result).toBe(fallback)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects private URLs without fallback', async () => {
    global.fetch = vi.fn()
    await expect(
      imageURLToDataURI('http://169.254.169.254/latest/meta-data/')
    ).rejects.toThrow(/not allowed/)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
