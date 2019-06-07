import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import CheckoutValidFlag from '../../components/checkout/CheckoutValidFlag'

storiesOf('Checkout/Valid Key', module)
  .addDecorator(getStory => (
    <div
      style={{
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignContent: 'center',
        display: 'flex',
      }}
    >
      {getStory()}
    </div>
  ))
  .add('Valid key flag', () => {
    return (
      <CheckoutValidFlag
        unlockKey={{
          expiration: new Date('December 17, 2119 00:00:00').getTime() / 1000,
        }}
        showModal={action('showModal')}
      />
    )
  })
