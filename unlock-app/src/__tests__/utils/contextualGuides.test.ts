import { describe, expect, it } from 'vitest'
import {
  contextualGuideCallouts,
  contextualGuideOrder,
} from '~/utils/contextualGuides'

describe('contextualGuideCallouts', () => {
  it('covers the creation contexts requested by the guide-link issue', () => {
    expect(contextualGuideOrder).toEqual([
      'membership',
      'event',
      'certification',
    ])
  })

  it('points each callout at an Unlock guide', () => {
    for (const key of contextualGuideOrder) {
      const guide = contextualGuideCallouts[key]

      expect(guide.title).toMatch(/^Need help creating/)
      expect(guide.description.length).toBeGreaterThan(70)
      expect(guide.href).toMatch(/^https:\/\/unlock-protocol\.com\/guides\//)
      expect(guide.href).toMatch(/\/$/)
      expect(guide.linkLabel).toMatch(/^Open .+ guide$/)
    }
  })

  it('keeps each guide mapped to the matching creation workflow', () => {
    expect(contextualGuideCallouts.membership.href).toContain('membership')
    expect(contextualGuideCallouts.event.href).toContain('tickets')
    expect(contextualGuideCallouts.certification.href).toContain(
      'certifications'
    )
  })
})
