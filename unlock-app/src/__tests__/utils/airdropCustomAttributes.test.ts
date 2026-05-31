import { describe, expect, it } from 'vitest'
import {
  buildAirdropCustomMetadata,
  getAirdropCustomAttributeKey,
  validateAirdropCustomAttributes,
} from '../../utils/airdropCustomAttributes'

describe('airdropCustomAttributes', () => {
  it('normalizes custom attribute keys', () => {
    expect(getAirdropCustomAttributeKey(' tier.level ', false)).toBe(
      'tier_level'
    )
    expect(getAirdropCustomAttributeKey(' tier.level ', true)).toBe(
      'tier_level.public'
    )
    expect(getAirdropCustomAttributeKey('   ', true)).toBe('')
  })

  it('builds trimmed custom metadata and skips empty rows', () => {
    expect(
      buildAirdropCustomMetadata([
        { name: ' membership.type ', value: ' VIP ', isPublic: false },
        { name: 'nickname', value: ' Alice ', isPublic: true },
        { name: '', value: '', isPublic: false },
      ])
    ).toEqual({
      membership_type: 'VIP',
      'nickname.public': 'Alice',
    })
  })

  it('requires both a name and a value for partial rows', () => {
    expect(
      validateAirdropCustomAttributes([
        { name: 'tier', value: '', isPublic: false },
      ])
    ).toBe('Custom attributes need both a name and a value.')

    expect(
      validateAirdropCustomAttributes([
        { name: '', value: 'VIP', isPublic: false },
      ])
    ).toBe('Custom attributes need both a name and a value.')
  })

  it('rejects duplicate normalized names', () => {
    expect(
      validateAirdropCustomAttributes([
        { name: 'membership.type', value: 'VIP', isPublic: false },
        { name: 'membership_type', value: 'Founder', isPublic: false },
      ])
    ).toBe('Custom attribute names must be unique.')
  })

  it('allows matching private and public metadata keys', () => {
    expect(
      validateAirdropCustomAttributes([
        { name: 'membership.type', value: 'VIP', isPublic: false },
        { name: 'membership_type', value: 'Founder', isPublic: true },
      ])
    ).toBeNull()
  })
})
