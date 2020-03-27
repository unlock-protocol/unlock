import React from 'react'
import { storiesOf } from '@storybook/react'
import { CheckoutSignup } from '../../../components/interface/checkout/CheckoutSignup'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import doNothing from '../../../utils/doNothing'

storiesOf('CheckoutSignup', module)
  .addDecorator(getStory => {
    return (
      <CheckoutContainer close={doNothing}>
        <CheckoutWrapper hideCheckout={doNothing} allowClose>
          {getStory()}
        </CheckoutWrapper>
      </CheckoutContainer>
    )
  })
  .add('Default', () => {
    return <CheckoutSignup signupEmail={doNothing} toggleSignup={doNothing} />
  })
