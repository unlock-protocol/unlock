import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecoverContent } from '../../components/content/RecoverContent'
import { ConfigContext } from '../../utils/withConfig'

const account = {}

const email = 'julien@unlock-protocol.com'
const recoveryPhrase = 'recoveryPhrase'
const recoveryKey = {}
const config = {}

storiesOf('RecoverContent', module)
  .add('Link is missing email', () => {
    return (
      <ConfigContext.Provider value={config}>
        <RecoverContent query={{ recoveryKey }} />
      </ConfigContext.Provider>
    )
  })
  .add('No recovery phrase', () => {
    return (
      <ConfigContext.Provider value={config}>
        <RecoverContent query={{ email }} />
      </ConfigContext.Provider>
    )
  })
  .add('show the password reset form', () => {
    return (
      <ConfigContext.Provider value={config}>
        <RecoverContent query={{ email, recoveryKey }} />
      </ConfigContext.Provider>
    )
  })
