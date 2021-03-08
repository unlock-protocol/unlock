import React from 'react'
import * as rtl from '@testing-library/react'
import { ConfigContext } from '../../../utils/withConfig'
import configure from '../../../config'

import { RecoverContent } from '../../../components/content/RecoverContent'

const config = configure()
const ConfigProvider = ConfigContext.Provider
const emailAddress = 'julien@unlock-protocol.com'
const account = {}
const recoveryPhrase = 'recoveryPhrase'

const changePassword = () => {}

describe('RecoverContent', () => {
  it.skip('should show a message when the email is missing from the link', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <RecoverContent changePassword={changePassword} />
      </ConfigProvider>
    )
    expect(
      wrapper.getByText('Your recovery link is not valid. Please try again.')
    ).not.toBeNull()
  })

  it.skip('should indicate that the private key is being decrypted', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <RecoverContent
          changePassword={changePassword}
          emailAddress={emailAddress}
        />
      </ConfigProvider>
    )
    expect(
      wrapper.getByText(
        'Checking your recovery key... This may take a couple seconds.'
      )
    ).not.toBeNull()
  })

  it.skip('should show a message when the password as succesfully reset', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <RecoverContent
          changePassword={changePassword}
          emailAddress={emailAddress}
          account={account}
        />
      </ConfigProvider>
    )
    expect(wrapper.getByText('Your password was changed!')).not.toBeNull()
  })

  it.skip('should show the password reset form when applicable', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <RecoverContent
          recoveryPhrase={recoveryPhrase}
          changePassword={changePassword}
          emailAddress={emailAddress}
          account={account}
        />
      </ConfigProvider>
    )
    expect(wrapper.getByText('Confirm Password')).not.toBeNull()
  })
})
