import type { MetadataInputType } from '@unlock-protocol/core'
import {
  getPublicInputs,
  formResultToMetadata,
  shouldHydrateMetadataInput,
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

  describe('shouldHydrateMetadataInput', () => {
    it('fills empty inputs from saved metadata', () => {
      expect.assertions(1)

      expect(
        shouldHydrateMetadataInput({
          inputType: 'text',
          savedValue: 'Ada',
          currentValue: '',
          isDirty: false,
        })
      ).toBe(true)
    })

    it('does not replace non-empty text inputs', () => {
      expect.assertions(1)

      expect(
        shouldHydrateMetadataInput({
          inputType: 'text',
          savedValue: 'Ada',
          currentValue: 'Grace',
          isDirty: false,
        })
      ).toBe(false)
    })

    it('does not replace inputs changed by the buyer', () => {
      expect.assertions(1)

      expect(
        shouldHydrateMetadataInput({
          inputType: 'checkbox',
          savedValue: 'true',
          currentValue: 'false',
          isDirty: true,
        })
      ).toBe(false)
    })

    it('hydrates checkbox inputs with their saved value', () => {
      expect.assertions(1)

      expect(
        shouldHydrateMetadataInput({
          inputType: 'checkbox',
          savedValue: 'true',
          currentValue: 'false',
          isDirty: false,
        })
      ).toBe(true)
    })

    it('ignores empty saved metadata values', () => {
      expect.assertions(1)

      expect(
        shouldHydrateMetadataInput({
          inputType: 'text',
          savedValue: '',
          currentValue: '',
          isDirty: false,
        })
      ).toBe(false)
    })
  })
})
