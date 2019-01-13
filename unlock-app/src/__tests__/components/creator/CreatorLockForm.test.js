import React from 'react'
import * as rtl from 'react-testing-library'

import { CreatorLockForm } from '../../../components/creator/CreatorLockForm'

describe('CreatorLockForm', () => {
  let hideAction
  let createLock
  let wrapper

  beforeEach(() => {
    hideAction = jest.fn()
    createLock = jest.fn()

    wrapper = rtl.render(
      <CreatorLockForm
        hideAction={hideAction}
        createLock={createLock}
        account={{ address: 'hi' }}
      />
    )
  })
  it('should not allow a form with invalid data to be submitted', () => {
    // Setting name to be an invalid value (empty)
    let name = wrapper.queryByValue('New Lock')
    rtl.fireEvent.change(name, { target: { value: '' } })

    rtl.fireEvent.click(wrapper.queryByText('Submit'))

    // Form should still exist
    expect(wrapper.queryByText('Submit')).not.toBeNull()
  })
  it('should signal field as invalid if the data is not valid', () => {
    expect.assertions(12)

    // Setting name to be an invalid value (empty)
    let name = wrapper.queryByValue('New Lock')
    expect(name.dataset.valid).toBe(undefined)
    rtl.fireEvent.change(name, { target: { value: '' } })
    expect(name.dataset.valid).toBe('false')
    rtl.fireEvent.change(name, { target: { value: 'My lock' } })
    expect(name.dataset.valid).toBe('true')

    // Setting expirationDuration to be an invalid value (a string)
    let expirationDuration = wrapper.queryByValue('30')
    expect(expirationDuration.dataset.valid).toBe(undefined)
    rtl.fireEvent.change(expirationDuration, { target: { value: 'abc' } })
    expect(expirationDuration.dataset.valid).toBe('false')
    rtl.fireEvent.change(expirationDuration, { target: { value: '100' } })
    expect(expirationDuration.dataset.valid).toBe('true')

    // Setting maxNumberOfKeys to be an invalid value (a string)
    let maxNumberOfKeys = wrapper.queryByValue('10')
    expect(maxNumberOfKeys.dataset.valid).toBe(undefined)
    rtl.fireEvent.change(maxNumberOfKeys, { target: { value: 'abc' } })
    expect(maxNumberOfKeys.dataset.valid).toBe('false')
    rtl.fireEvent.change(maxNumberOfKeys, { target: { value: '1000' } })
    expect(maxNumberOfKeys.dataset.valid).toBe('true')

    // Setting keyPrice to be an invalid value (a string)
    let keyPrice = wrapper.queryByValue('0.01')
    expect(keyPrice.dataset.valid).toBe(undefined)
    rtl.fireEvent.change(keyPrice, { target: { value: 'abc' } })
    expect(keyPrice.dataset.valid).toBe('false')
    rtl.fireEvent.change(keyPrice, { target: { value: '0.1' } })
    expect(keyPrice.dataset.valid).toBe('true')
  })

  it('should not consider maxNumberOfKeys to be invalid when using the infinity symbol', () => {
    expect.assertions(5)

    // Setting maxNumberOfKeys to be an invalid value (a string)
    let maxNumberOfKeys = wrapper.queryByValue('10')
    expect(maxNumberOfKeys.dataset.valid).toBe(undefined)
    rtl.fireEvent.change(maxNumberOfKeys, { target: { value: 'abc' } })
    expect(maxNumberOfKeys.dataset.valid).toBe('false')

    // Let's now change

    let unlimitedLabel = wrapper.queryByText('Unlimited')
    expect(unlimitedLabel).not.toBeNull()

    rtl.fireEvent.click(unlimitedLabel)
    expect(wrapper.queryByValue('∞')).not.toBeNull()
    expect(maxNumberOfKeys.dataset.valid).toBe('true')
  })

  it('should display infinity symbol when unlimited is clicked and mark the field as valid', () => {
    let unlimitedLabel = wrapper.queryByText('Unlimited')
    expect(unlimitedLabel).not.toBeNull()
    expect(wrapper.queryByText('Submit')).not.toBeNull()

    rtl.fireEvent.click(unlimitedLabel)
    expect(wrapper.queryByText('Unlimited')).toBeNull()
    expect(wrapper.queryByValue('∞')).not.toBeNull()
  })
  it('should enable the "Unlimited" label after infinity is replaced with a finite number', () => {
    let unlimitedLabel = wrapper.queryByText('Unlimited')
    expect(unlimitedLabel).not.toBeNull()
    expect(wrapper.queryByText('Submit')).not.toBeNull()

    rtl.fireEvent.click(unlimitedLabel)
    expect(wrapper.queryByText('Unlimited')).toBeNull()
    expect(wrapper.queryByValue('∞')).not.toBeNull()

    let numberOfKeys = wrapper.queryByValue('∞')
    rtl.fireEvent.change(numberOfKeys, { target: { value: '12' } })
    expect(wrapper.queryByText('Unlimited')).not.toBeNull()
  })
})
