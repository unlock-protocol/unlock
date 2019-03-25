import React from 'react'
import * as rtl from 'react-testing-library'

import {
  CreatorLockForm,
  lockToFormValues,
  formValuesToLock,
} from '../../../components/creator/CreatorLockForm'
import {
  FORM_LOCK_NAME_MISSING,
  FORM_MAX_KEYS_INVALID,
  FORM_EXPIRATION_DURATION_INVALID,
  FORM_KEY_PRICE_INVALID,
} from '../../../errors'

import { INFINITY, UNLIMITED_KEYS_COUNT } from '../../../constants'

describe('lockToFormValues', () => {
  it('should return an object with the expirationDuration in the right unit', () => {
    expect.assertions(1)
    const lock = {
      expirationDuration: 24 * 60 * 60 * 365, // 1 year in seconds
      expirationDurationUnit: 86400, // 1 day
    }
    expect(lockToFormValues(lock).expirationDuration).toBe(365)
  })

  it('should preserve the name, address, keyPrice, outstandingKeys and balance', () => {
    expect.assertions(6)
    const lock = {
      name: 'hello',
      address: 'address',
      keyPrice: '0.1',
      outstandingKeys: '1',
      balance: '10',
      maxNumberOfKeys: '100',
    }
    const formValues = lockToFormValues(lock)
    expect(formValues.name).toBe(lock.name)
    expect(formValues.address).toBe(lock.address)
    expect(formValues.keyPrice).toBe(lock.keyPrice)
    expect(formValues.outstandingKeys).toBe(lock.outstandingKeys)
    expect(formValues.balance).toBe(lock.balance)
    expect(formValues.maxNumberOfKeys).toBe(lock.maxNumberOfKeys)
  })

  it('should return an object with the right format for unlimitedKeys', () => {
    expect.assertions(2)
    const lock = {
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
    }
    expect(lockToFormValues(lock).unlimitedKeys).toBe(true)
    expect(lockToFormValues(lock).maxNumberOfKeys).toBe(INFINITY)
  })
})

describe('formValuesToLock', () => {
  it('should return an object with the name, keyPrice, maxNumberOfKeys', () => {
    expect.assertions(5)
    const formValues = {
      name: 'Lock',
      keyPrice: '0.1',
      maxNumberOfKeys: '10',
      expirationDuration: '1',
      expirationDurationUnit: '1',
      address: '0xabc',
    }
    expect(formValuesToLock(formValues).name).toBe(formValues.name)
    expect(formValuesToLock(formValues).keyPrice).toBe(formValues.keyPrice)
    expect(formValuesToLock(formValues).maxNumberOfKeys).toBe(
      formValues.maxNumberOfKeys
    )
    expect(formValuesToLock(formValues).expirationDuration).toBe(1)
    expect(formValuesToLock(formValues).address).toBe(formValues.address)
  })

  it('should handle unlimitedKeys', () => {
    expect.assertions(1)
    const formValues = {
      name: 'Lock',
      keyPrice: '0.1',
      maxNumberOfKeys: '10',
      expirationDuration: '1',
      unlimitedKeys: true,
    }
    expect(formValuesToLock(formValues).maxNumberOfKeys).toBe(
      UNLIMITED_KEYS_COUNT
    )
  })
})

describe('CreatorLockForm', () => {
  let actions = {}

  function makeLockForm(
    lock = {},
    {
      createLock = jest.fn(),
      hideAction = jest.fn(),
      setError = jest.fn(),
      resetError = jest.fn(),
    } = {}
  ) {
    actions = {
      createLock,
      hideAction,
      setError,
      resetError,
    }
    const ret = rtl.render(
      <CreatorLockForm
        account={{ address: 'hi' }}
        createLock={createLock}
        hideAction={hideAction}
        setError={setError}
        resetError={resetError}
        lock={lock}
      />
    )
    return ret
  }
  const secondsInADay = 86400
  const allFormErrors = [
    FORM_EXPIRATION_DURATION_INVALID,
    FORM_KEY_PRICE_INVALID,
    FORM_MAX_KEYS_INVALID,
    FORM_LOCK_NAME_MISSING,
  ]

  function expectErrors(errorList = []) {
    expect(actions.resetError).toHaveBeenCalledTimes(
      allFormErrors.length - errorList.length
    )
    expect(actions.setError).toHaveBeenCalledTimes(errorList.length)
    errorList.forEach(error =>
      expect(actions.setError).toHaveBeenCalledWith(error)
    )
    allFormErrors
      .filter(error => !errorList.includes(error))
      .forEach(error => expect(actions.resetError).toHaveBeenCalledWith(error))
  }

  describe('things that should not fail', () => {
    it('properly handle unlimited keys when editing', () => {
      expect.assertions(7)
      const wrapper = makeLockForm({ maxNumberOfKeys: UNLIMITED_KEYS_COUNT })

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()

      rtl.fireEvent.click(submit)
      // The error most likely to occur in this instance is
      // FORM_MAX_KEYS_INVALID.
      expectErrors([])
    })
  })

  describe('invalid values', () => {
    it('name is empty', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ name: '' })
      expect(wrapper.getByValue('').dataset.valid).toBe('false')
    })

    it('key expiration is a negative number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ expirationDuration: -2 * secondsInADay })
      expect(wrapper.getByValue('-2').dataset.valid).toBe('false')
    })

    it('max number of keys is missing', () => {
      expect.assertions(1)
      const save = console.error // eslint-disable-line
      console.error = () => {} // eslint-disable-line
      try {
        const wrapper = makeLockForm({ maxNumberOfKeys: '' })
        expect(wrapper.getByValue('').dataset.valid).toBe('false')
      } finally {
        console.error = save // eslint-disable-line
      }
    })

    it('max number of keys is not a number', () => {
      expect.assertions(1)
      const save = console.error // eslint-disable-line
      console.error = () => {} // eslint-disable-line
      try {
        const wrapper = makeLockForm({ maxNumberOfKeys: 'abc' })
        expect(wrapper.getByValue('abc').dataset.valid).toBe('false')
      } finally {
        console.error = save // eslint-disable-line
      }
    })

    it('max number of keys is a negative number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ maxNumberOfKeys: -2 })
      expect(wrapper.getByValue('-2').dataset.valid).toBe('false')
    })

    it('key price is not a number', () => {
      expect.assertions(1)
      const save = console.error // eslint-disable-line
      console.error = () => {} // eslint-disable-line
      try {
        const wrapper = makeLockForm({ keyPrice: 'abc' })
        expect(wrapper.getByValue('abc').dataset.valid).toBe('false')
      } finally {
        console.error = save // eslint-disable-line
      }
    })

    it('key price is a negative number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ keyPrice: '-1' })
      expect(wrapper.getByValue('-1').dataset.valid).toBe('false')
    })

    describe('submit button triggers setError once for each possible error', () => {
      it('name is empty', () => {
        expect.assertions(7)
        const wrapper = makeLockForm({ name: '' })
        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()
        rtl.fireEvent.click(submit)
        expectErrors([FORM_LOCK_NAME_MISSING])
      })

      it('key expiration is not a number', () => {
        expect.assertions(7)
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ expirationDuration: 'abc' })
          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()
          rtl.fireEvent.click(submit)
          expectErrors([FORM_EXPIRATION_DURATION_INVALID])
        } finally {
          console.error = save // eslint-disable-line
        }
      })

      it('key expiration is a negative number', () => {
        expect.assertions(7)
        const wrapper = makeLockForm({ expirationDuration: -1 })
        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()
        rtl.fireEvent.click(submit)
        expectErrors([FORM_EXPIRATION_DURATION_INVALID])
      })

      it('max number of keys is not a number', () => {
        expect.assertions(7)
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ maxNumberOfKeys: 'abc' })
          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()
          rtl.fireEvent.click(submit)
          expectErrors([FORM_MAX_KEYS_INVALID])
        } finally {
          console.error = save // eslint-disable-line
        }
      })

      it('max number of keys is a negative number', () => {
        expect.assertions(7)
        const wrapper = makeLockForm({ maxNumberOfKeys: -2 })
        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()
        rtl.fireEvent.click(submit)
        expectErrors([FORM_MAX_KEYS_INVALID])
      })

      it('key price is not a number', () => {
        expect.assertions(7)
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ keyPrice: 'abc' })
          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()
          rtl.fireEvent.click(submit)
          expectErrors([FORM_KEY_PRICE_INVALID])
        } finally {
          console.error = save // eslint-disable-line
        }
      })

      it('key price is a negative number', () => {
        expect.assertions(7)
        const wrapper = makeLockForm({ keyPrice: '-1' })
        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()
        rtl.fireEvent.click(submit)
        expectErrors([FORM_KEY_PRICE_INVALID])
      })

      it('multiple errors', () => {
        expect.assertions(7)
        const wrapper = makeLockForm({ keyPrice: '-1', name: '' })
        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()
        rtl.fireEvent.click(submit)
        expectErrors([FORM_KEY_PRICE_INVALID, FORM_LOCK_NAME_MISSING])
      })
    })
  })

  describe('valid values', () => {
    it('calls resetErrors', () => {
      expect.assertions(0) // WEIRD: we do not assert anything!
      makeLockForm({ name: 'One Month Subscription' })
    })

    it('name is a string', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ name: 'One Month Subscription' })
      expect(wrapper.getByValue('One Month Subscription').dataset.valid).toBe(
        'true'
      )
    })

    it('key expiration is a positive number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ expirationDuration: 35 * secondsInADay })
      expect(wrapper.getByValue('35').dataset.valid).toBe('true')
    })

    it('max number of keys is a positive number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ maxNumberOfKeys: 35 })
      expect(wrapper.getByValue('35').dataset.valid).toBe('true')
    })

    it('max number of keys is infinity', () => {
      expect.assertions(2)
      const wrapper = makeLockForm({ maxNumberOfKeys: UNLIMITED_KEYS_COUNT })
      expect(wrapper.getByDisplayValue(INFINITY)).not.toBeNull()
      expect(wrapper.getByValue(INFINITY).dataset.valid).toBe('true')
    })

    it('key price is a positive number', () => {
      expect.assertions(1)
      const wrapper = makeLockForm({ keyPrice: '0.01' })
      expect(wrapper.getByValue('0.01').dataset.valid).toBe('true')
    })

    it('submit button is enabled and activates on submit', () => {
      expect.assertions(2)
      const wrapper = makeLockForm({ convert: true }) // remove the "convert" prop when it is no longer necessary

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()
      rtl.fireEvent.click(submit)
      expect(actions.createLock).toHaveBeenCalledWith(
        expect.objectContaining({
          expirationDuration: 2592000,
          keyPrice: '0.01',
          maxNumberOfKeys: 10,
          name: 'New Lock',
          owner: 'hi',
        })
      )
    })

    it('submit button triggers resetError once for each possible error', () => {
      expect.assertions(7)
      const wrapper = makeLockForm()
      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()
      rtl.fireEvent.click(submit)
      expectErrors()
    })
  })

  describe('saving', () => {
    it('should skip saving locks when the price is not changed', () => {
      expect.assertions(2)
      const createLock = jest.fn()
      const lock = {
        keyPrice: '999',
        address: '0x123',
      }
      const wrapper = makeLockForm({ createLock, lock })
      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()
      rtl.fireEvent.click(submit)
      expect(createLock).not.toHaveBeenCalled()
    })

    it('should save the lock when the price has been updated', () => {
      expect.assertions(2)
      const createLock = jest.fn()
      const lock = {
        keyPrice: '999',
        address: '0x123',
      }
      const wrapper = makeLockForm(lock, { createLock })

      // Change the keyPrice
      const input = wrapper.getByValue('999')
      rtl.fireEvent.change(input, {
        target: {
          value: '1000',
        },
      })

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()
      rtl.fireEvent.click(submit)
      expect(createLock).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x123',
          keyPrice: '1000',
        })
      )
    })

    it('should save a new lock', () => {
      expect.assertions(2)
      const createLock = jest.fn()
      const wrapper = makeLockForm({} /* lock */, { createLock })

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()
      rtl.fireEvent.click(submit)
      expect(createLock).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrice: '0.01',
          maxNumberOfKeys: 10,
          name: 'New Lock',
          address: null,
          expirationDuration: 2592000,
        })
      )
    })
  })

  it('cancel dismisses the form', () => {
    expect.assertions(1)
    const wrapper = makeLockForm()
    const cancel = wrapper.getByText('Cancel')
    rtl.fireEvent.click(cancel)
    expect(actions.hideAction).toHaveBeenCalled()
  })
})
