import React from 'react'
import * as rtl from '@testing-library/react'
import { MetadataForm } from '../../../../components/interface/checkout/MetadataForm'
import { MetadataInput } from '../../../../unlockTypes'

const fieldsNoRequired: MetadataInput[] = [
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
]

const fieldsWithRequired: MetadataInput[] = [
  {
    name: 'First Name',
    type: 'text',
    required: true,
    public: true,
  },
  {
    name: 'Last Name',
    type: 'text',
    required: true,
  },
]

const lock = {}

const recipientsObj = {
  recipients: [],
  loading: false,
  maxRecipients: 1,
  submitBulkRecipients: () => true,
  addRecipient: () => undefined,
  clear: () => undefined,
  removeRecipient: () => undefined,
}

describe.skip('Metadata Form', () => {
  describe('no required fields', () => {
    let onSubmit: jest.Mock<any, any>
    let submitButton: any
    let firstNameInput: any

    beforeEach(() => {
      onSubmit = jest.fn()
      const { getByText, getByLabelText } = rtl.render(
        <MetadataForm
          network={1}
          lock={lock}
          fields={fieldsNoRequired}
          onSubmit={onSubmit}
          {...recipientsObj}
        />
      )
      submitButton = getByText('Continue')
      firstNameInput = getByLabelText('First Name')
    })

    it('returns an object with all keys and empty string values without input', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        publicData: {
          'First Name': '',
        },
        protectedData: {
          'Last Name': '',
        },
      })
    })

    it('returns an object with all keys and values on fields with input', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.change(firstNameInput, { target: { value: 'Jeff' } })
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        publicData: {
          'First Name': 'Jeff',
        },
        protectedData: {
          'Last Name': '',
        },
      })
    })
  })

  describe('with required fields', () => {
    let onSubmit: jest.Mock<any, any>
    let submitButton: any
    let firstNameInput: any
    let lastNameInput: any

    beforeEach(() => {
      onSubmit = jest.fn()
      const { getByText, getByLabelText } = rtl.render(
        <MetadataForm
          network={1}
          fields={fieldsWithRequired}
          onSubmit={onSubmit}
          lock={lock}
          {...recipientsObj}
        />
      )
      submitButton = getByText('Continue')
      firstNameInput = getByLabelText('First Name')
      lastNameInput = getByLabelText('Last Name')
    })

    it('does not submit without input', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('does not submit with partial input', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.change(firstNameInput, { target: { value: 'Jeff' } })
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits with full input', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.change(firstNameInput, { target: { value: 'Jeff' } })
        rtl.fireEvent.change(lastNameInput, { target: { value: 'Petersen' } })
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        publicData: {
          'First Name': 'Jeff',
        },
        protectedData: {
          'Last Name': 'Petersen',
        },
      })
    })
  })

  describe('with default values', () => {
    let onSubmit: jest.Mock<any, any>
    let submitButton: any
    let firstNameInput: any
    let lastNameInput: any

    beforeEach(() => {
      onSubmit = jest.fn()
      const { getByText, getByLabelText } = rtl.render(
        <MetadataForm
          network={1}
          fields={fieldsWithRequired}
          onSubmit={onSubmit}
          lock={lock}
          {...recipientsObj}
        />
      )
      submitButton = getByText('Continue')
      firstNameInput = getByLabelText('First Name')
      lastNameInput = getByLabelText('Last Name')
    })

    it('submits with the default value if it was not changed', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        publicData: {
          'First Name': 'Satoshi',
        },
        protectedData: {
          'Last Name': 'Nakomoto',
        },
      })
    })

    it('submits with changed inputs', async () => {
      expect.assertions(1)

      await rtl.act(async () => {
        rtl.fireEvent.change(firstNameInput, { target: { value: 'Jeff' } })
        rtl.fireEvent.change(lastNameInput, {
          target: { value: 'Petersen' },
        })
        rtl.fireEvent.click(submitButton)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        publicData: {
          'First Name': 'Jeff',
        },
        protectedData: {
          'Last Name': 'Petersen',
        },
      })
    })
  })
})
