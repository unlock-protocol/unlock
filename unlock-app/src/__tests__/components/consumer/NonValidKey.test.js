import React from 'react'
import { shallow } from 'enzyme'
import { NonValidKey } from '../../../components/consumer/NonValidKey'

describe('NonValidKey Component', () => {

  const account = {
    address: '0xabc',
  }
  const lock = {
    keyPrice: '100',
    expirationDuration: '10',
  }

  describe('when the current key has an expiration date of 0 (no key was ever purchased)', () => {

    const purchaseKey = jest.fn()
    const currentKey = {
      expiration: 0,
    }
    const component = (<NonValidKey currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)
    const wrapper = shallow(component)

    it('shows the purchase button', () => {
      // Check the text is right
      const keyInfo = 'You need a key to access this content! Purchase one that is valid'
      expect(wrapper.find('Duration').props()).toEqual({
        seconds: '10',
      })

      expect(wrapper.find('.card-text').html()).toContain(keyInfo)

      // Check that the balance is righ
      expect(wrapper.find('Balance').first().props()).toEqual({
        amount: '100',
      })

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

    const currentKey = {
      expiration: 1,
    }
    const purchaseKey = jest.fn()
    const component = (<NonValidKey currentKey={currentKey} account={account} lock={lock} purchaseKey={purchaseKey} />)

    it('shows the purchase button', () => {
      // Check the text is right
      const wrapper = shallow(component)
      const keyInfo = 'Your key has expired! Purchase a new one for'
      expect(wrapper.text()).toContain(keyInfo)

      // Check that the balance is righ
      expect(wrapper.find('Balance').first().props()).toEqual({
        amount: '100',
      })

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

})
