import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import configure from '../../../config'

import {
  mapStateToProps,
  mapDispatchToProps,
  RecoverContent,
} from '../../../components/content/RecoverContent'
import { changePassword } from '../../../actions/user'

const config = configure()
const ConfigProvider = ConfigContext.Provider
const emailAddress = 'julien@unlock-protocol.com'
const account = {}
const recoveryPhrase = 'recoveryPhrase'

describe('RecoverContent', () => {
  let store = createUnlockStore({})

  it('should show a message when the email is missing from the link', () => {
    expect.assertions(1)
    let wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <RecoverContent changePassword={changePassword} />
        </ConfigProvider>
      </Provider>
    )
    expect(
      wrapper.getByText('Your recovery link is not valid. Please try again.')
    ).not.toBeNull()
  })

  it('should indicate that the private key is being decrypted', () => {
    expect.assertions(1)

    let wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <RecoverContent
            changePassword={changePassword}
            emailAddress={emailAddress}
          />
        </ConfigProvider>
      </Provider>
    )
    expect(
      wrapper.getByText(
        'Checking your recovery key... This may take a couple seconds.'
      )
    ).not.toBeNull()
  })

  it('should show a message when the password as succesfully reset', () => {
    expect.assertions(1)

    let wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <RecoverContent
            changePassword={changePassword}
            emailAddress={emailAddress}
            account={account}
          />
        </ConfigProvider>
      </Provider>
    )
    expect(wrapper.getByText('Your password was changed!')).not.toBeNull()
  })

  it('should show the password reset form when applicable', () => {
    expect.assertions(1)

    let wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <RecoverContent
            recoveryPhrase={recoveryPhrase}
            changePassword={changePassword}
            emailAddress={emailAddress}
            account={account}
          />
        </ConfigProvider>
      </Provider>
    )
    expect(wrapper.getByText('Confirm Password')).not.toBeNull()
  })

  describe('mapStateToProps', () => {
    it('should return the email from the query string, the account and the recoveryPhrase', () => {
      expect.assertions(1)
      const account = {}
      const recoveryPhrase = 'recovery'
      const router = {
        location: {
          search: '?email=julien.genestoux@gmail.com',
        },
      }

      expect(
        mapStateToProps({
          account,
          recoveryPhrase,
          router,
        })
      ).toEqual({
        account,
        recoveryPhrase,
        emailAddress: 'julien.genestoux@gmail.com',
      })
    })

    it('should return an empty email if there is none, the account and the recoveryPhrase', () => {
      expect.assertions(1)
      const account = {}
      const recoveryPhrase = 'recovery'
      const router = {
        location: {
          search: '?',
        },
      }

      expect(
        mapStateToProps({
          account,
          recoveryPhrase,
          router,
        })
      ).toEqual({
        account,
        recoveryPhrase,
        emailAddress: '',
      })
    })
  })

  describe('mapDispatchToProps', () => {
    it('should return a function changePassword', () => {
      expect.assertions(1)

      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch)
      const recoveryPhrase = 'recoveryPhrase'
      const emailAddress = 'julien@unlock-protocol.com'
      const password = 'password'
      props.changePassword(
        {
          emailAddress,
          password,
        },
        recoveryPhrase
      )

      expect(dispatch).toHaveBeenCalledWith(
        changePassword(recoveryPhrase, password)
      )
    })
  })
})
