import React from 'react'
import { storiesOf } from '@storybook/react'
import StaticDemo from '../../components/interface/StaticDemo'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'

const config = {
  env: 'dev',
  providers: { HTTP: {}, Metamask: {} },
  requiredConfirmations: 12,
}

const fakeWindow = {
  fetch: () => ({
    // dummy to prevent errors on CI
    // this is the expected shape of returns from locksmith for optimism
    json: Promise.resolve({ willSucceed: 0 }),
  }),
  document: { body: { style: {} } },
  location: { pathname: '/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e' },
}

storiesOf('StaticDemo', module)
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        {getStory()}
      </WindowContext.Provider>
    </ConfigContext.Provider>
  ))
  .add('the demo', () => {
    return <StaticDemo />
  })
