import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Account } from '../../components/Account'

describe('Account Component', () => {

  const account = {
    address: '0xdeadbeef',
    balance: '1000',
  }
  const showAccountPicker = jest.fn()
  const useMetamask = jest.fn()

  const wrapper = shallow(<Account
    account={account}
    showAccountPicker={showAccountPicker} />)

  it('shows the current account\'s public key', () => {
    expect(wrapper.find('span').first().text()).toEqual('0xdeadbeef')
  })

  it('shows the current account\'s balance', () => {
    expect(wrapper.find('Balance').first().props()).toEqual({
      amount: '1000',
    })
  })

  describe('when metamask is available', () => {
    describe('when metamask is being used', () => {
      const metamaskUsedWrapper = shallow(<Account
        metamaskAvailable={true}
        isMetamask={true}
        account={account}
        showAccountPicker={showAccountPicker} />)

      it('should not show a switch account button', () => {
        const button = metamaskUsedWrapper.find('button.js-accountSwitch')
        expect(button.exists()).toEqual(false)
      })
    })

    describe('when metamask is not being used', () => {
      const wrapperMetamaskNotUsed = shallow(<Account
        useMetamask={useMetamask}
        metamaskAvailable={true}
        isMetamask={false}
        account={account}
        showAccountPicker={showAccountPicker} />)

      it('shows a button to use metamask', () => {
        const button = wrapperMetamaskNotUsed.find('button.js-accountUseMetamask')
        expect(button.text()).toEqual('Use metamask')
        button.simulate('click')
        expect(useMetamask).toBeCalledWith()
      })

      it('shows a button to switch accounts', () => {
        const button = wrapperMetamaskNotUsed.find('button.js-accountSwitch')
        expect(button.text()).toEqual('Switch')
        button.simulate('click')
        expect(showAccountPicker).toBeCalledWith()
      })
    })
  })

  describe('when metamask is not available', () => {
    const wrapperMetamaskNotAvailable = shallow(<Account
      metamaskAvailable={false}
      account={account}
      showAccountPicker={showAccountPicker} />)

    it('shows no metamask button')

    it('shows a button to switch accounts', () => {
      const button = wrapperMetamaskNotAvailable.find('button.js-accountSwitch')
      expect(button.text()).toEqual('Switch')
      button.simulate('click')
      expect(showAccountPicker).toBeCalledWith()
    })

  })

})