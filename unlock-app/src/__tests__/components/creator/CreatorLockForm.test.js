import React from 'react'
import * as rtl from 'react-testing-library'

import { CreatorLockForm } from '../../../components/creator/CreatorLockForm'

describe('CreatorLockForm', () => {
  let createLock
  let hideAction
  function makeLockForm(values = {}) {
    createLock = jest.fn()
    hideAction = jest.fn()
    const ret = rtl.render(
      <CreatorLockForm
        hideAction={hideAction}
        createLock={createLock}
        account={{ address: 'hi' }}
        {...values}
      />
    )
    return ret
  }

  describe('invalid values', () => {
    it('name is empty', () => {
      const wrapper = makeLockForm({ name: '' })

      expect(wrapper.getByValue('').dataset.valid).toBe('false')
    })
    it('key expiration is not a number', () => {
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
      const wrapper = makeLockForm({ expirationDuration: -1 })

      expect(wrapper.getByValue('-1').dataset.valid).toBe('false')
    })
    it('max number of keys is missing', () => {
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
      const wrapper = makeLockForm({ maxNumberOfKeys: -1 })

      expect(wrapper.getByValue('-1').dataset.valid).toBe('false')
    })
    it('key price is not a number', () => {
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
      const wrapper = makeLockForm({ keyPrice: '-1' })

      expect(wrapper.getByValue('-1').dataset.valid).toBe('false')
    })
    describe('submit button triggers setError once for each possible error', () => {
      it('name is empty', () => {
        const wrapper = makeLockForm({ name: '' })

        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()

        rtl.fireEvent.click(submit)
      })
      it('key expiration is not a number', () => {
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ expirationDuration: 'abc' })

          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()

          rtl.fireEvent.click(submit)
        } finally {
          console.error = save // eslint-disable-line
        }
      })
      it('key expiration is a negative number', () => {
        const wrapper = makeLockForm({ expirationDuration: -1 })

        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()

        rtl.fireEvent.click(submit)
      })
      it('max number of keys is not a number', () => {
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ maxNumberOfKeys: 'abc' })

          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()

          rtl.fireEvent.click(submit)
        } finally {
          console.error = save // eslint-disable-line
        }
      })
      it('max number of keys is a negative number', () => {
        const wrapper = makeLockForm({ maxNumberOfKeys: -1 })

        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()

        rtl.fireEvent.click(submit)
      })
      it('key price is not a number', () => {
        const save = console.error // eslint-disable-line
        console.error = () => {} // eslint-disable-line
        try {
          const wrapper = makeLockForm({ keyPrice: 'abc' })

          const submit = wrapper.getByText('Submit')
          expect(submit).not.toBeNull()

          rtl.fireEvent.click(submit)
        } finally {
          console.error = save // eslint-disable-line
        }
      })
      it('key price is a negative number', () => {
        const wrapper = makeLockForm({ keyPrice: '-1' })

        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()

        rtl.fireEvent.click(submit)
      })
      it('multiple errors', () => {
        const wrapper = makeLockForm({ keyPrice: '-1', name: '' })

        const submit = wrapper.getByText('Submit')
        expect(submit).not.toBeNull()

        rtl.fireEvent.click(submit)
      })
    })
  })
  describe('valid values', () => {
    it('calls resetErrors', () => {
      makeLockForm({ name: 'One Month Subscription' })
    })
    it('name is a string', () => {
      const wrapper = makeLockForm({ name: 'One Month Subscription' })
      expect(wrapper.getByValue('One Month Subscription').dataset.valid).toBe(
        'true'
      )
    })
    it('key expiration is a positive number', () => {
      const wrapper = makeLockForm({ expirationDuration: 35 })

      expect(wrapper.getByValue('35').dataset.valid).toBe('true')
    })
    it('max number of keys is a positive number', () => {
      const wrapper = makeLockForm({ maxNumberOfKeys: 35 })

      expect(wrapper.getByValue('35').dataset.valid).toBe('true')
    })
    it('max number of keys is infinity', () => {
      const wrapper = makeLockForm({ maxNumberOfKeys: '∞' })

      expect(wrapper.getByValue('∞').dataset.valid).toBe('true')
    })
    it('key price is a positive number', () => {
      const wrapper = makeLockForm({ keyPrice: '0.01' })

      expect(wrapper.getByValue('0.01').dataset.valid).toBe('true')
    })
    it('submit button is enabled and activates on submit', () => {
      const wrapper = makeLockForm()

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()

      rtl.fireEvent.click(submit)

      expect(createLock).toHaveBeenCalledWith(
        expect.objectContaining({
          expirationDuration: 2592000,
          keyPrice: '10000000000000000',
          maxNumberOfKeys: 10,
          name: 'New Lock',
          owner: 'hi',
        })
      )
    })
    it('submit button triggers resetError once for each possible error', () => {
      const wrapper = makeLockForm()

      const submit = wrapper.getByText('Submit')
      expect(submit).not.toBeNull()

      rtl.fireEvent.click(submit)
    })
  })
  it('cancel dismisses the form', () => {
    const wrapper = makeLockForm()

    const cancel = wrapper.getByText('Cancel')
    rtl.fireEvent.click(cancel)

    expect(hideAction).toHaveBeenCalled()
  })
})
