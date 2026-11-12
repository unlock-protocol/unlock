// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CheckoutContainer } from '../../components/interface/checkout/CheckoutContainer'
import { CheckoutPage } from '../../components/interface/checkout'
import { useCheckoutConfig } from '../../hooks/useCheckoutConfig'

const state = vi.hoisted(() => ({ searchParams: new URLSearchParams() }))

vi.mock('next/navigation', () => ({
  useSearchParams: () => state.searchParams,
}))
vi.mock('~/hooks/useCheckoutCommunication', () => ({
  useCheckoutCommunication: () => ({}),
}))
vi.mock('~/hooks/useCheckoutConfig', () => ({ useCheckoutConfig: vi.fn() }))
vi.mock('~/utils/paywallConfig', () => ({
  getPaywallConfigFromQuery: (query: URLSearchParams) => {
    const value = query.get('paywallConfig')
    return value ? JSON.parse(value) : undefined
  },
}))
vi.mock('~/utils/oauth', () => ({ default: () => undefined }))
vi.mock('../../components/interface/checkout/main', () => ({
  Checkout: ({ paywallConfig }: { paywallConfig: { title: string } }) => (
    <p>{paywallConfig.title}</p>
  ),
}))
vi.mock('../../components/interface/checkout/Shell', () => ({
  CloseButton: () => null,
}))
vi.mock('../../components/interface/checkout/PoweredByUnlock', () => ({
  PoweredByUnlock: () => null,
}))
vi.mock('../../components/interface/checkout/Connect', () => ({
  Connect: () => null,
}))
vi.mock('react-icons/cg', () => ({ CgSpinner: () => <span>Loading</span> }))
vi.mock('ethers', () => ({ ethers: { isAddress: () => false } }))

describe('checkout configuration selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.searchParams = new URLSearchParams()
    vi.mocked(useCheckoutConfig).mockReturnValue({
      isLoading: false,
      data: { config: { title: 'Saved checkout', locks: {} } },
    } as ReturnType<typeof useCheckoutConfig>)
  })

  it('loads the checkout identified by the path rather than a conflicting query ID', () => {
    state.searchParams.set('id', 'query-id')

    expect(
      renderToStaticMarkup(<CheckoutContainer checkoutId="path-id" />)
    ).toContain('Saved checkout')
    expect(useCheckoutConfig).toHaveBeenCalledWith({ id: 'path-id' })
  })

  it('passes the saved ID through the checkout page to its container', () => {
    renderToStaticMarkup(<CheckoutPage checkoutId="path-id" />)

    expect(useCheckoutConfig).toHaveBeenCalledWith({ id: 'path-id' })
  })

  it('retains the legacy query ID fallback', () => {
    state.searchParams.set('id', 'query-id')
    renderToStaticMarkup(<CheckoutContainer />)

    expect(useCheckoutConfig).toHaveBeenCalledWith({ id: 'query-id' })
  })

  it('renders an inline paywall configuration without a saved checkout ID', () => {
    vi.mocked(useCheckoutConfig).mockReturnValue({
      isLoading: false,
      data: null,
    } as ReturnType<typeof useCheckoutConfig>)
    state.searchParams.set(
      'paywallConfig',
      JSON.stringify({ title: 'Inline checkout', locks: {} })
    )

    expect(renderToStaticMarkup(<CheckoutContainer />)).toContain(
      'Inline checkout'
    )
    expect(useCheckoutConfig).toHaveBeenCalledWith({ id: undefined })
  })
})
