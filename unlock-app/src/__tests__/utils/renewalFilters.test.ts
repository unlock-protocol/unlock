import { describe, expect, it } from 'vitest'
import { ZeroAddress } from 'ethers'
import { isRecurringRenewalLock } from '../../utils/renewalFilters'

const recurringLock = {
  keyPrice: '1000000000000000000',
  tokenAddress: '0x123',
  version: 12,
  expirationDuration: 60 * 60 * 24 * 30,
}

describe('renewalFilters', () => {
  it('detects paid ERC-20 locks that support recurring renewal filters', () => {
    expect(isRecurringRenewalLock(recurringLock)).toBe(true)
  })

  it('hides renewal filters for free locks', () => {
    expect(isRecurringRenewalLock({ ...recurringLock, keyPrice: 0 })).toBe(
      false
    )
  })

  it('hides renewal filters for native currency locks', () => {
    expect(
      isRecurringRenewalLock({
        ...recurringLock,
        tokenAddress: ZeroAddress,
      })
    ).toBe(false)
  })

  it('hides renewal filters for old lock versions', () => {
    expect(isRecurringRenewalLock({ ...recurringLock, version: 10 })).toBe(
      false
    )
  })

  it('hides renewal filters for unlimited or very long locks', () => {
    expect(
      isRecurringRenewalLock({ ...recurringLock, expirationDuration: -1 })
    ).toBe(false)
    expect(
      isRecurringRenewalLock({
        ...recurringLock,
        expirationDuration: 60 * 60 * 24 * 365 * 101,
      })
    ).toBe(false)
  })
})
