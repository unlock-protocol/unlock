import { describe, expect, it } from 'vitest'

import {
  getVisibleSettingTabIds,
  isPaidLock,
} from '~/components/interface/locks/Settings/settingsTabs'

describe('settings tab visibility', () => {
  it('shows discount codes for paid locks', () => {
    expect(getVisibleSettingTabIds({ keyPrice: '1' })).toContain(
      'discount-codes'
    )
  })

  it('hides discount codes for free locks', () => {
    expect(getVisibleSettingTabIds({ keyPrice: '0' })).not.toContain(
      'discount-codes'
    )
  })

  it('treats missing and invalid prices as not paid', () => {
    expect(isPaidLock()).toBe(false)
    expect(isPaidLock({ keyPrice: 'not-a-number' })).toBe(false)
  })
})
