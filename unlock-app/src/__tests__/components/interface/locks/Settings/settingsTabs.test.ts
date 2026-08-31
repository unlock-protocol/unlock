import { describe, expect, it } from 'vitest'
import { shouldShowDiscountCodesTab } from '~/components/interface/locks/Settings/settingsTabs'

describe('lock settings tabs', () => {
  it('shows discount codes for paid locks after lock data loads', () => {
    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: '0.01' },
      })
    ).toBe(true)

    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: 1 },
      })
    ).toBe(true)
  })

  it('hides discount codes for free locks', () => {
    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: '0' },
      })
    ).toBe(false)
  })

  it('hides discount codes until valid lock data is available', () => {
    expect(
      shouldShowDiscountCodesTab({
        isLoading: true,
        lock: { keyPrice: '1' },
      })
    ).toBe(false)
    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
      })
    ).toBe(false)
    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: 'not-a-number' },
      })
    ).toBe(false)
  })
})
