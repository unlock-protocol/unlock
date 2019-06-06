import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, number } from '@storybook/addon-knobs'

import CheckoutConfirmingFlag from '../../components/checkout/CheckoutConfirmingFlag'

storiesOf('Checkout/Optimistic Unlocking', module)
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
  .addDecorator(withKnobs)
  .add('Checkout confirming flag', () => {
    return (
      <CheckoutConfirmingFlag
        unlockKey={{
          confirmations: number('confirmations', 2),
        }}
        requiredConfirmations={12}
      />
    )
  })
