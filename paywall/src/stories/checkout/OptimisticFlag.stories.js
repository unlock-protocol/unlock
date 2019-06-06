import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, number } from '@storybook/addon-knobs'

import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'
import CheckoutFlag from '../../components/checkout/CheckoutConfirmingFlag'

const ConfigProvider = ConfigContext.Provider

const config = configure()

storiesOf('Checkout/Optimistic Unlocking', module)
  .addDecorator(getStory => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignContent: 'center',
        display: 'flex',
      }}
    >
      <ConfigProvider value={config}>{getStory()}</ConfigProvider>
    </div>
  ))
  .addDecorator(withKnobs)
  .add('Optimistic unlocking flag', () => {
    return (
      <CheckoutFlag unlockKey={{ confirmations: number('confirmations', 2) }} />
    )
  })
