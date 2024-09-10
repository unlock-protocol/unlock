import { it, describe, expect } from 'vitest'
import { shouldSkip } from '~/components/interface/checkout/main/utils'

describe('shouldSkip', () => {
  it('it should skip if skipRecipient is set at the root level', () => {
    expect(
      shouldSkip({
        lock: { maxRecipients: 1 },
        paywallConfig: {
          skipRecipient: true,
          locks: {
            '0x123': { maxRecipients: 1 },
          },
        },
      }).skipRecipient
    ).toBe(true)
  })
  it('it should not skip if skipRecipient is set to true but if there are metadataInputs', () => {
    expect(
      shouldSkip({
        lock: { maxRecipients: 1 },
        paywallConfig: {
          skipRecipient: true,
          metadataInputs: [
            {
              type: 'email',
              name: 'email',
              required: true,
              public: false,
            },
          ],
          locks: {
            '0x123': { maxRecipients: 1 },
          },
        },
      }).skipRecipient
    ).toBe(false)
  })

  it('it should skip if skipRecipient is set to true and if there are only hidden metadataInputs', () => {
    expect(
      shouldSkip({
        lock: { maxRecipients: 1 },
        paywallConfig: {
          skipRecipient: true,
          metadataInputs: [
            {
              type: 'hidden',
              name: 'email',
              required: true,
              public: false,
            },
          ],
          locks: {
            '0x123': { maxRecipients: 1 },
          },
        },
      }).skipRecipient
    ).toBe(true)
  })

  it('it should not skip if skipRecipient is set to true and if there are non-hidden metadataInputs', () => {
    expect(
      shouldSkip({
        lock: { maxRecipients: 1 },
        paywallConfig: {
          skipRecipient: true,
          metadataInputs: [
            {
              type: 'hidden',
              name: 'email',
              required: true,
              public: false,
            },
            {
              type: 'text',
              name: 'name',
              required: true,
              public: false,
            },
          ],
          locks: {
            '0x123': { maxRecipients: 1 },
          },
        },
      }).skipRecipient
    ).toBe(false)
  })
})
