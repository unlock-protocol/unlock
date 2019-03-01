import React from 'react'
import { storiesOf } from '@storybook/react'
import { EmbedCodeSnippet } from '../../components/creator/lock/EmbedCodeSnippet'
import { ConfigContext } from '../../utils/withConfig'

storiesOf('LockCodeSnippet', module)
  .addDecorator(getStory => (
    <ConfigContext.Provider
      value={{
        paywallUrl: 'http://localhost',
        paywallScriptUrl: 'http://localhost/static/paywall.min.js',
      }}
    >
      {getStory()}
    </ConfigContext.Provider>
  ))
  .add('with sample lock', () => {
    const lock = {
      address: '0xa62142888aba8370742be823c1782d17a0389da1',
    }
    return <EmbedCodeSnippet lock={lock} />
  })
