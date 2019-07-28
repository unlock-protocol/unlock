import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, number } from '@storybook/addon-knobs'
import ConfirmingFlag from '../../components/paywall/ConfirmingFlag'
import ConfirmedFlag from '../../components/paywall/ConfirmedFlag'

storiesOf('Paywall/Optimistic Unlocking Flags', module)
  .addDecorator(getStory => {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignContent: 'center',
          display: 'flex',
        }}
      >
        {getStory()}
      </div>
    )
  })
  .addDecorator(withKnobs)
  .add('the confirming flag', () => {
    return (
      <ConfirmingFlag
        requiredConfirmations={5}
        transaction={{ confirmations: number('confirmations', 2) }}
      />
    )
  })
  .add('the confirmed flag', () => {
    return <ConfirmedFlag dismiss={action('dismiss')} />
  })
