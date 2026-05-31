import { describe, expect, it } from 'vitest'
import {
  cloneEventCheckoutConfigForLockOnNetwork,
  defaultEventCheckoutConfigForLockOnNetwork,
} from '../../utils/cloneEvent'

describe('cloneEvent checkout config helpers', () => {
  it('remaps the source lock config to the newly deployed event lock', () => {
    const checkoutConfig = {
      title: 'Original registration',
      pessimistic: true,
      locks: {
        '0xsource': {
          network: 1,
          name: 'Original lock',
          metadataInputs: [
            {
              name: 'company',
              type: 'text',
              label: 'Company',
              required: false,
            },
          ],
        },
      },
    }

    expect(
      cloneEventCheckoutConfigForLockOnNetwork(
        checkoutConfig,
        '0xsource',
        '0xnew',
        137
      )
    ).toEqual({
      title: 'Original registration',
      pessimistic: true,
      network: 137,
      locks: {
        '0xnew': {
          network: 137,
          name: 'Original lock',
          metadataInputs: [
            {
              name: 'company',
              type: 'text',
              label: 'Company',
              required: false,
            },
          ],
        },
      },
    })
  })

  it('falls back to the default event registration config when the source lock is missing', () => {
    expect(
      cloneEventCheckoutConfigForLockOnNetwork(
        {
          title: 'Original registration',
          locks: {
            '0xother': {
              network: 1,
            },
          },
        },
        '0xsource',
        '0xnew',
        137
      )
    ).toEqual(defaultEventCheckoutConfigForLockOnNetwork('0xnew', 137))
  })
})
