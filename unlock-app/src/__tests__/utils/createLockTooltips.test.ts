import { describe, expect, it } from 'vitest'
import {
  createLockTooltipOrder,
  createLockTooltips,
} from '~/utils/createLockTooltips'

describe('createLockTooltips', () => {
  it('covers the agreed lock creation onboarding terms', () => {
    expect(createLockTooltipOrder).toEqual([
      'network',
      'name',
      'duration',
      'quantity',
      'price',
    ])
  })

  it('keeps each tooltip concise and user-facing', () => {
    for (const key of createLockTooltipOrder) {
      const tooltip = createLockTooltips[key]

      expect(tooltip).toMatch(/\.$/)
      expect(tooltip.length).toBeGreaterThan(40)
      expect(tooltip.length).toBeLessThanOrEqual(140)
      expect(tooltip).not.toMatch(/\bERC-721\b|\bmax number of keys\b/i)
    }
  })

  it('explains the product decision behind each field', () => {
    expect(createLockTooltips.network).toContain('gas fees')
    expect(createLockTooltips.name).toContain('public name')
    expect(createLockTooltips.duration).toContain('expires')
    expect(createLockTooltips.quantity).toContain('airdrop')
    expect(createLockTooltips.price).toContain('Free memberships')
  })
})
