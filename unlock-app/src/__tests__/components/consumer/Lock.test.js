import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Lock } from '../../../components/consumer/Lock'

jest.mock('../../../services/iframeService', () => {
  return {
    unlockIfKeyIsValid: jest.fn(),
  }
})

describe('Lock Component', () => {

  it('shows that it is loading if lock or currentKey is not set', () => {
    expect(shallow(<Lock />).equals(<span>Loading...</span>)).toEqual(true)
  })

  describe('when the current key has an expiration date of 0 (no key was ever purchased)', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
      expirationDuration: '10',
    }

    const currentKey = {
      expiration: 0,
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows NonValidKey component', () => {
      // Check the text is right
      const wrapper = shallow(component)
      expect(wrapper.find('NonValidKey').props()).toEqual({
        account,
        lock,
        currentKey,
        purchaseKey,
      })
    })

  })

  describe('when the current key has an expiration date in the past', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
      expirationDuration: '10',
    }
    const currentKey = {
      expiration: 1,
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows NonValidKey component', () => {
      // Check the text is right
      const wrapper = shallow(component)
      expect(wrapper.find('NonValidKey').props()).toEqual({
        account,
        lock,
        currentKey,
        purchaseKey,
      })
    })
  })

  describe('when the current key has an expiration date in the future', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
    }
    const currentKey = {
      expiration: (new Date().getTime() + 1000 * 60 * 60 * 24) / 1000, // tomorrow
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows Key component', () => {
      // Check the text is right
      const wrapper = shallow(component)
      expect(wrapper.find('Key').props()).toEqual({
        currentKey,
      })
    })

  })

})