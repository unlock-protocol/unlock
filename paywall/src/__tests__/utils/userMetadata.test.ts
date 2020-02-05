import { MetadataInput } from '../../unlockTypes'
import {
  getProtectedInputs,
  formResultToMetadata,
} from '../../utils/userMetadata'

const inputs: MetadataInput[] = [
  {
    name: 'First Name',
    type: 'text',
    required: false,
  },
  {
    name: 'Last Name',
    type: 'text',
    required: false,
    protected: true,
  },
  {
    name: 'Email Address',
    type: 'text',
    required: false,
    protected: true,
  },
]

const formResult = {
  'First Name': 'Saxton',
  'Last Name': 'Hale',
  'Email Address': 'ceo@mann.co',
}

describe('userMetadata utils', () => {
  describe('getProtectedInputs', () => {
    it('returns an object mapping protected inputs to true', () => {
      expect.assertions(1)

      const result = getProtectedInputs(inputs)

      expect(result).toEqual({
        'First Name': false,
        'Last Name': true,
        'Email Address': true,
      })
    })
  })

  describe('formResultToMetadata', () => {
    it('processes a form submission into the correct structure', () => {
      expect.assertions(1)

      expect(formResultToMetadata(formResult, inputs)).toEqual({
        privateData: {
          'Last Name': 'Hale',
          'Email Address': 'ceo@mann.co',
        },
        publicData: {
          'First Name': 'Saxton',
        },
      })
    })
  })
})
