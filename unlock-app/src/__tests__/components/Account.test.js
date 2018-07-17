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
  const config = {
    metamaskAvailable: true,
  }

  const wrapper = shallow(<Account
    account={account}
    showAccountPicker={showAccountPicker}
    config={config} />)

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
      const config = { metamaskAvailable: true }
      const metamaskUsedWrapper = shallow(<Account
        config={config}
        isMetamask={true}
        account={account}
        showAccountPicker={showAccountPicker} />)

      it('should not show a switch account button', () => {
        const button = metamaskUsedWrapper.find('button.js-accountSwitch')
        expect(button.exists()).toEqual(false)
      })
    })

    describe('when metamask is not being used', () => {
      const config = { metamaskAvailable: true }
      const wrapperMetamaskNotUsed = shallow(<Account
        useMetamask={useMetamask}
        config={config}
        isMetamask={false}
        account={account}
        showAccountPicker={showAccountPicker} />)

      it('shows a button to use metamask', () => {
        const button = wrapperMetamaskNotUsed.find('a.js-accountUseMetamask')
        expect(button).toExist()

        expect(button.contains(<img src="/images/icons/icon-metamask.png" className="icon" />)).toBe(true)

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
    const config = { metamaskAvailable: true }
    const wrapperMetamaskNotAvailable = shallow(<Account
      config={config}
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