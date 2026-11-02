import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getConfig, fetchMetadata } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchMetadata: vi.fn(),
}))

vi.mock('../../../app/frames/checkout/components/utils', () => ({ getConfig }))
vi.mock('frames.js/next', () => ({ fetchMetadata }))
vi.mock('~/components/interface/checkout', () => ({
  CheckoutPage: () => null,
}))
vi.mock('~/config/app', () => ({
  config: { unlockApp: 'https://app.unlock-protocol.com/' },
}))

import { generateMetadata } from '../../../app/checkout/[id]/page'

const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'
const baseTitle = 'Checkout | Unlock Protocol'

describe('/checkout/[id] generateMetadata', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    getConfig.mockReset()
    fetchMetadata.mockReset()
  })

  it('sets the canonical url, title, og image and frame tags', async () => {
    expect.assertions(4)
    getConfig.mockResolvedValue({ title: 'My membership' })
    fetchMetadata.mockResolvedValue({ 'fc:frame': 'vNext' })

    const metadata = await generateMetadata({ params: { id } })

    expect(metadata.title).toBe('My membership')
    // no double slash although unlockApp has a trailing slash
    expect(metadata.alternates?.canonical).toBe(
      `https://app.unlock-protocol.com/checkout/${id}`
    )
    expect(metadata.openGraph?.images).toEqual([`/og/checkout?id=${id}`])
    expect(metadata.other).toEqual({ 'fc:frame': 'vNext' })
  })

  it('keeps the page metadata when the frame request fails, and logs the id', async () => {
    expect.assertions(3)
    getConfig.mockResolvedValue({ title: 'My membership' })
    fetchMetadata.mockRejectedValue(new Error('frame down'))

    const metadata = await generateMetadata({ params: { id } })

    expect(metadata.title).toBe('My membership')
    expect(metadata.other).toEqual({})
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(id),
      expect.any(Error)
    )
  })

  it('falls back to the base metadata and logs the id when the config does not exist', async () => {
    expect.assertions(3)
    getConfig.mockResolvedValue(undefined)
    fetchMetadata.mockResolvedValue({})

    const metadata = await generateMetadata({ params: { id } })

    expect(metadata.title).toBe(baseTitle)
    expect(metadata.alternates).toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(id))
  })

  it('falls back to the base metadata and logs the id when locksmith fails', async () => {
    expect.assertions(2)
    getConfig.mockRejectedValue(new Error('locksmith down'))
    fetchMetadata.mockResolvedValue({})

    const metadata = await generateMetadata({ params: { id } })

    expect(metadata.title).toBe(baseTitle)
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(id),
      expect.any(Error)
    )
  })

  it('does not call locksmith or the frames route for ids that cannot be a saved config', async () => {
    expect.assertions(5)

    for (const bad of ['', '   ', 'a/b', 'x'.repeat(129)]) {
      const metadata = await generateMetadata({ params: { id: bad } })
      expect(metadata.title).toBe(baseTitle)
    }
    expect(getConfig).not.toHaveBeenCalled()
  })
})
