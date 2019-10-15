import React from 'react'
import { Provider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecoverContent } from '../../components/content/RecoverContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'

const account = {}

const emailAddress = 'julien@unlock-protocol.com'

const changePassword = action('change password')

const recoveryPhrase = 'recoveryPhrase'
const store = createUnlockStore({})
const config = {}

storiesOf('RecoverContent', module)
  .add('Link is missing email', () => {
    return (
      <ConfigContext.Provider value={config}>
        <Provider store={store}>
          <RecoverContent changePassword={changePassword} />
        </Provider>
      </ConfigContext.Provider>
    )
  })
  .add('No account set yet', () => {
    return (
      <ConfigContext.Provider value={config}>
        <Provider store={store}>
          <RecoverContent
            changePassword={changePassword}
            emailAddress={emailAddress}
          />
        </Provider>
      </ConfigContext.Provider>
    )
  })
  .add('No recovery phrase', () => {
    return (
      <ConfigContext.Provider value={config}>
        <Provider store={store}>
          <RecoverContent
            changePassword={changePassword}
            emailAddress={emailAddress}
            account={account}
          />
        </Provider>
      </ConfigContext.Provider>
    )
  })
  .add('show the password reset form', () => {
    return (
      <ConfigContext.Provider value={config}>
        <Provider store={store}>
          <RecoverContent
            recoveryPhrase={recoveryPhrase}
            changePassword={changePassword}
            emailAddress={emailAddress}
            account={account}
          />
        </Provider>
      </ConfigContext.Provider>
    )
  })
