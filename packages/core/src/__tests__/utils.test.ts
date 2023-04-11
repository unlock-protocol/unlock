import { expect, it, describe } from 'vitest'
import { getLockTypeByMetadata } from '../utils'

describe('utils - getLockTypeByMetadata', () => {
  it('should have default values when metadata is undefined', () => {
    expect.assertions(3)
    const types = getLockTypeByMetadata(undefined)
    expect(types.isEvent).toBe(false)
    expect(types.isCertification).toBe(false)
    expect(types.isStamp).toBe(false)
  })

  it('should return default with random attributes', () => {
    expect.assertions(3)
    const types = getLockTypeByMetadata({
      name: 'Test',
      attributes: [
        { trait_type: 'attribute_1', value: '' },
        { trait_type: 'attribute_2', value: '' },
      ],
    })
    expect(types.isEvent).toBe(false)
    expect(types.isCertification).toBe(false)
    expect(types.isStamp).toBe(false)
  })

  it('should has isEvent set when event attributes are present', () => {
    expect.assertions(3)
    const types = getLockTypeByMetadata({
      name: 'Test',
      attributes: [
        { trait_type: 'event_start_date', value: '' },
        { trait_type: 'event_end_date', value: '' },
      ],
    })
    expect(types.isEvent).toBe(true)
    expect(types.isCertification).toBe(false)
    expect(types.isStamp).toBe(false)
  })

  it('should has isCertification set when event attributes are present', () => {
    expect.assertions(3)
    const types = getLockTypeByMetadata({
      name: 'Test',
      attributes: [{ trait_type: 'certification_issuer', value: '' }],
    })
    expect(types.isCertification).toBe(true)
    expect(types.isEvent).toBe(false)
    expect(types.isStamp).toBe(false)
  })

  it('should has isStamp set when event attributes are present', () => {
    expect.assertions(3)
    const types = getLockTypeByMetadata({
      name: 'Test',
      attributes: [{ trait_type: 'stamp_attribute', value: '' }],
    })
    expect(types.isStamp).toBe(true)
    expect(types.isEvent).toBe(false)
    expect(types.isCertification).toBe(false)
  })
})
