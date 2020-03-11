import React from 'react'
import { storiesOf } from '@storybook/react'
import { SwitchPayment } from '../../../components/interface/checkout/SwitchPayment'
import doNothing from '../../../utils/doNothing'

const paymentOptions = ['Credit Card', 'BAT', 'USDC', 'DAI']

storiesOf('Checkout Payment Selection', module)
  .add('Switch Payment', () => {
    return (
      <SwitchPayment
        paymentOptions={paymentOptions}
        activePayment={null}
        setActivePayment={doNothing}
      />
    )
  })
  .add('With active payment', () => {
    return (
      <SwitchPayment
        paymentOptions={paymentOptions}
        activePayment="USDC"
        setActivePayment={doNothing}
      />
    )
  })
