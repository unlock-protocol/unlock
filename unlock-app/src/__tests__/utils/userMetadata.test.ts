import type { MetadataInputType } from '@unlock-protocol/core'
import {
  getPublicInputs,
  formResultToMetadata,
  userMetadataToFormResult,
} from '../../utils/userMetadata'
import { expect, it, describe } from 'vitest'
const inputs: MetadataInputType[] = [
  {
    name: 'First Name',
    type: 'text',
    required: false,
    public: true,
  },
  {
    name: 'Last Name',
    type: 'text',
    required: false,
  },
  {
    name: 'Email Address',
    type: 'text',
    required: false,
  },
]

const formResult = {
  'First Name': 'Saxton',
  'Last Name': 'Hale',
  'Email Address': 'ceo@mann.co',
}

describe('userMetadata utils', () => {
  describe('getPublicInputs', () => {
    it('returns an object mapping public inputs to true', () => {
      expect.assertions(1)

      const result = getPublicInputs(inputs)

      expect(result).toEqual({
        'First Name': true,
        'Last Name': false,
        'Email Address': false,
      })
    })
  })

  describe('formResultToMetadata', () => {
    it('processes a form submission into the correct structure', () => {
      expect.assertions(1)

      expect(formResultToMetadata(formResult, inputs)).toEqual({
        protectedData: {
          'Last Name': 'Hale',
          'Email Address': 'ceo@mann.co',
        },
        publicData: {
          'First Name': 'Saxton',
        },
      })
    })
  })

  describe('userMetadataToFormResult', () => {
    it('prepares saved metadata values for matching form inputs', () => {
      expect.assertions(1)

      expect(
        userMetadataToFormResult(
          {
            public: {
              'first name': 'Saxton',
            },
            protected: {
              'last name': 'Hale',
              'email address': 'ceo@mann.co',
              ignored: 'value',
            },
          },
          inputs
        )
      ).toEqual(formResult)
    })
  })
})
