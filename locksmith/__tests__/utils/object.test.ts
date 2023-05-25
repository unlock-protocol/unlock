import { it, describe, expect } from 'vitest'
import { lowercaseObjectKeys } from '../../src/utils/object'

describe('lowercaseObjectKeys', () => {
  it('should lowercase all object keys', () => {
    expect.assertions(9)
    const obj = {
      FIRSTNAME: 'mario',
      LASTNAME: 'rossi',
      addressLine1: 'via portorico',
    }

    const lowercased = lowercaseObjectKeys(obj)

    // has all lowercase keys
    expect(lowercased).toHaveProperty('firstname')
    expect(lowercased).toHaveProperty('lastname')
    expect(lowercased).toHaveProperty('addressline1')

    // has all values for lowercased keys
    expect(lowercased.firstname).toBe('mario')
    expect(lowercased.lastname).toBe('rossi')
    expect(lowercased.addressline1).toBe('via portorico')

    // does not have old keys
    expect(lowercased).not.toHaveProperty('FIRSTNAME')
    expect(lowercased).not.toHaveProperty('LASTNAME')
    expect(lowercased).not.toHaveProperty('addressLine1')
  })
})
