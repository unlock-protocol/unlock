import { describe, expect, it } from 'vitest'
import { applyCustomMetadataFields } from '~/components/interface/members/airdrop/customMetadata'

describe('applyCustomMetadataFields', () => {
  it('maps manual custom metadata fields to protected and public airdrop metadata keys', () => {
    const member = applyCustomMetadataFields({
      wallet: '0x123',
      email: 'member@example.com',
      customFields: [
        {
          name: 'company',
          value: 'Unlock Labs',
          visibility: 'protected',
        },
        {
          name: 'seat',
          value: 'A12',
          visibility: 'public',
        },
      ],
    })

    expect(member).toEqual({
      wallet: '0x123',
      email: 'member@example.com',
      'company.protected': 'Unlock Labs',
      'seat.public': 'A12',
    })
  })

  it('ignores empty custom metadata rows', () => {
    const member = applyCustomMetadataFields({
      wallet: '0x123',
      customFields: [
        {
          name: 'company',
          value: '',
          visibility: 'protected',
        },
        {
          name: '',
          value: 'A12',
          visibility: 'public',
        },
      ],
    })

    expect(member).toEqual({
      wallet: '0x123',
    })
  })
})
