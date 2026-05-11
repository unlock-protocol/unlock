import { describe, expect, it } from 'vitest'
import { airdropMemberToMetadata } from '../../utils/airdropMetadata'

describe('airdropMemberToMetadata', () => {
  it('maps email and custom manual airdrop fields to protected metadata', () => {
    expect(
      airdropMemberToMetadata({
        wallet: '0xabc',
        count: 1,
        email: 'member@example.com',
        Role: 'Speaker',
      })
    ).toEqual({
      protected: {
        email: 'member@example.com',
        Role: 'Speaker',
      },
      public: {},
    })
  })

  it('maps fields suffixed with public to public metadata', () => {
    expect(
      airdropMemberToMetadata({
        wallet: '0xabc',
        count: 1,
        'Company.public': 'Unlock',
        'Ticket Type.protected': 'VIP',
      })
    ).toEqual({
      protected: {
        'Ticket Type': 'VIP',
      },
      public: {
        Company: 'Unlock',
      },
    })
  })
})
