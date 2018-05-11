import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Lock } from '../../../components/consumer/Lock'

describe('Lock Component', () => {

  it('shows that it is loading if lock or currentKey is not set', () => {
    expect(shallow(<Lock />).equals(<span>Loading...</span>)).toEqual(true)
  })

  describe('when the current key has an expiration date of 0 (no key was ever purchased)', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: () => 100,
      expirationDuration: () => 10,
    }

    const currentKey = {
      expiration: 0,
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows the purchase button', () => {
      // Check the text is right
      const wrapper = shallow(component)
      const keyInfo = 'You need a key to access this content! Purchase one that is valid 10 seconds for 100'
      expect(wrapper.find('.card-text').html()).toContain(keyInfo)

      // Make sure the button is right
      expect(wrapper.find('button').html()).toContain('Purchase')
    })

    it('invokes triggers the purchase action when the purchase button is clicked', () => {
      const wrapper = shallow(component)

      wrapper.find('button').simulate('click')
      expect(purchaseKey).toBeCalledWith(lock, account)
    })
  })

  describe('when the current key has an expiration date in the past', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: () => 100,
      expirationDuration: () => 10,
    }
    const currentKey = {
      expiration: 1,
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows the purchase button', () => {
      // Check the text is right
      const wrapper = shallow(component)
      const keyInfo = 'Your key has expired! Purchase a new one for 100.'
      expect(wrapper.text()).toContain(keyInfo)

      // Make sure the button is right
      const button = wrapper.find('button').first()
      expect(button.text()).toEqual('Purchase')
    })

    it('invokes triggers the purchase action when the purchase button is clicked', () => {
      const wrapper = shallow(component)

      wrapper.find('button').simulate('click')
      expect(purchaseKey).toBeCalledWith(lock, account)
    })
  })

  describe('when the current key has an expiration date in the future', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: () => 100,
    }
    const currentKey = {
      expiration: (new Date().getTime() + 1000 * 60 * 60 * 24) / 1000, // tomorrow
    }
    const purchaseKey = jest.fn()
    const component = (<Lock currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows an indication that the key is valid and no purchase button', () => {
      // Check the text is right
      const wrapper = shallow(component)
      const keyInfo = 'Your key expires at'
      expect(wrapper.text()).toContain(keyInfo)

      // Make sure there is no button
      expect(wrapper.find('button').length).toBe(0)
    })

  })

})