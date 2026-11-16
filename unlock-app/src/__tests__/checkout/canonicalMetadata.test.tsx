// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckoutPage, { generateMetadata } from '../../../app/checkout/[id]/page'
import InlineCheckoutPage, { metadata } from '../../../app/checkout/page'
import { CheckoutPage as CheckoutPageComponent } from '../../components/interface/checkout'
import { getConfig } from '../../../app/frames/checkout/components/utils'
import { fetchMetadata } from 'frames.js/next'

vi.mock('../../components/interface/checkout', () => ({
  CheckoutPage: vi.fn(() => null),
}))
vi.mock('../../../app/frames/checkout/components/utils', () => ({
  getConfig: vi.fn(),
}))
vi.mock('frames.js/next', () => ({ fetchMetadata: vi.fn() }))
vi.mock('~/config/app', () => ({
  config: { unlockApp: 'https://app.unlock-protocol.com' },
}))

const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'
const props = { params: { id } }
const canonical = `https://app.unlock-protocol.com/checkout/${id}`

describe('canonical checkout server page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('generates the canonical link and checkout metadata on the server', async () => {
    vi.mocked(getConfig).mockResolvedValue({ title: 'Saved checkout' })
    vi.mocked(fetchMetadata).mockResolvedValue({ 'fc:frame': 'vNext' })

    const result = await generateMetadata(props)

    expect(getConfig).toHaveBeenCalledWith(id)
    expect(fetchMetadata).toHaveBeenCalledWith(
      new URL(`https://app.unlock-protocol.com/frames/checkout?id=${id}`)
    )
    expect(result).toMatchObject({
      title: 'Saved checkout',
      alternates: { canonical },
      openGraph: { images: [`/og/checkout?id=${id}`] },
      other: { 'fc:frame': 'vNext' },
    })
  })

  it('keeps the canonical link when a saved checkout cannot be found', async () => {
    vi.mocked(getConfig).mockResolvedValue(null)

    expect(await generateMetadata(props)).toEqual({
      title: 'Checkout | Unlock Protocol',
      alternates: { canonical },
    })
    expect(fetchMetadata).not.toHaveBeenCalled()
  })

  it.each(['config', 'frames'])(
    'logs the ID and keeps canonical metadata on %s errors',
    async (source) => {
      const error = new Error('Local test failure')
      const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      vi.mocked(getConfig).mockResolvedValue({ title: 'Saved checkout' })
      if (source === 'config') {
        vi.mocked(getConfig).mockRejectedValue(error)
      } else {
        vi.mocked(fetchMetadata).mockRejectedValue(error)
      }

      try {
        expect(await generateMetadata(props)).toEqual({
          title: 'Checkout | Unlock Protocol',
          alternates: { canonical },
        })
        expect(log).toHaveBeenCalledWith(expect.stringContaining(id), error)
      } finally {
        log.mockRestore()
      }
    }
  )

  it('passes the path ID to the existing checkout component', () => {
    const page = CheckoutPage(props)

    expect(page.type).toBe(CheckoutPageComponent)
    expect(page.props.checkoutId).toBe(id)
  })

  it('renders inline and iframe checkouts without fetching a saved ID', () => {
    const page = InlineCheckoutPage({})

    expect(page).toMatchObject({ type: CheckoutPageComponent, props: {} })
    expect(metadata.title).toBe('Checkout | Unlock Protocol')
    expect(getConfig).not.toHaveBeenCalled()
    expect(fetchMetadata).not.toHaveBeenCalled()
  })
})
