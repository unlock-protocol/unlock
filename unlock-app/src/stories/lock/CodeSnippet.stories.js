import React from 'react'
import { Provider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import { EmbedCodeSnippet } from '../../components/creator/lock/EmbedCodeSnippet'
import { ConfigContext } from '../../utils/withConfig'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('LockCodeSnippet', module)
  .addDecorator(getStory => (
    <Provider store={store}>
      <ConfigContext.Provider
        value={{
          paywallUrl: 'http://localhost',
          paywallScriptUrl: 'http://localhost/static/paywall.min.js',
        }}
      >
        {getStory()}
      </ConfigContext.Provider>
    </Provider>
  ))
  .add('with sample lock', () => {
    const lock = {
      address: '0xa62142888aba8370742be823c1782d17a0389da1',
    }
    return <EmbedCodeSnippet lock={lock} />
  })
