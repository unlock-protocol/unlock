import { describe, expect, it } from 'vitest'
import { shouldShowDiscountCodesTab } from '~/components/interface/locks/Settings/settingsTabs'

describe('lock settings tabs', () => {
  it('shows discount codes for paid locks only after lock data loads', () => {
    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: '0.01' },
      })
    ).toBe(true)

    expect(
      shouldShowDiscountCodesTab({
        isLoading: false,
        lock: { keyPrice: '0' },
      })
    ).toBe(false)

    expect(
      shouldShowDiscountCodesTab({
        isLoading: true,
        lock: { keyPrice: '1' },
      })
    ).toBe(false)
  })
})
