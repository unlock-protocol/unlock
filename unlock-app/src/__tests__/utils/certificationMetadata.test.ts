import { describe, expect, it } from 'vitest'
import { getCertificationCustomMetadata } from '../../utils/certificationMetadata'

describe('getCertificationCustomMetadata', () => {
  it('filters internal certification traits and empty values', () => {
    expect(
      getCertificationCustomMetadata([
        { trait_type: 'Minted', value: 'May 31, 2026' },
        { trait_type: 'certification_issuer', value: '0xissuer' },
        { trait_type: '', value: 'hidden' },
        { value: 'missing trait' },
        { trait_type: 'Empty string', value: '' },
        { trait_type: 'Undefined value' },
        { trait_type: 'Null value', value: null },
        { trait_type: 'Cohort', value: 'Spring 2026' },
      ])
    ).toEqual([{ trait_type: 'Cohort', value: 'Spring 2026' }])
  })

  it('preserves zero-valued custom metadata', () => {
    expect(
      getCertificationCustomMetadata([
        { trait_type: 'Score', value: 0 },
        { trait_type: 'Attempts', value: 3 },
      ])
    ).toEqual([
      { trait_type: 'Score', value: 0 },
      { trait_type: 'Attempts', value: 3 },
    ])
  })

  it('handles missing attribute lists', () => {
    expect(getCertificationCustomMetadata()).toEqual([])
    expect(getCertificationCustomMetadata(null)).toEqual([])
  })
})
