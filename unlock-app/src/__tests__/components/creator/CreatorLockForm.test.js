import React from 'react'
import * as rtl from 'react-testing-library'

import { CreatorLockForm } from '../../../components/creator/CreatorLockForm'
import {
  FORM_LOCK_NAME_MISSING,
  FORM_MAX_KEYS_INVALID,
  FORM_EXPIRATION_DURATION_INVALID,
  FORM_KEY_PRICE_INVALID,
} from '../../../errors'

import { INFINITY, UNLIMITED_KEYS_COUNT } from '../../../constants'

describe('CreatorLockForm', () => {
  let createLock
  let hideAction
  let setError
  let resetError
  function makeLockForm(values = {}) {
    createLock = jest.fn()
    hideAction = jest.fn()
    setError = jest.fn()
    resetError = jest.fn()
    const ret = rtl.render(
      <CreatorLockForm
        account={{ address: 'hi' }}
        createLock={createLock}
        hideAction={hideAction}
        setError={setError}
        resetError={resetError}
        {...values}
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
    expect(resetError).toHaveBeenCalledTimes(
      allFormErrors.length - errorList.length
    )
    expect(setError).toHaveBeenCalledTimes(errorList.length)
    errorList.forEach(error => expect(setError).toHaveBeenCalledWith(error))
    allFormErrors
      .filter(error => !errorList.includes(error))
      .forEach(error => expect(resetError).toHaveBeenCalledWith(error))
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

    it('key expiration is not a number', () => {
      expect.assertions(1)
      const save = console.error // eslint-disable-line
      console.error = () => {} // eslint-disable-line
      try {
        const wrapper = makeLockForm({ expirationDuration: 'abc' })

        expect(wrapper.getByValue('abc').dataset.valid).toBe('false')
      } finally {
        console.error = save // eslint-disable-line
      }
    })

    it('key expiration is missing', () => {
      expect.assertions(1)
      const save = console.error // eslint-disable-line
      console.error = () => {} // eslint-disable-line
      try {
        const wrapper = makeLockForm({ expirationDuration: '' })
        expect(wrapper.getByValue('').dataset.valid).toBe('false')
      } finally {
        console.error = save // eslint-disable-line
      }
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
      expect(createLock).toHaveBeenCalledWith(
        expect.objectContaining({
          expirationDuration: 2592000,
          keyPrice: '0.01',
          maxNumberOfKeys: 10,
          unlimitedKeys: false,
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

  it('cancel dismisses the form', () => {
    expect.assertions(1)
    const wrapper = makeLockForm()
    const cancel = wrapper.getByText('Cancel')
    rtl.fireEvent.click(cancel)
    expect(hideAction).toHaveBeenCalled()
  })
})
