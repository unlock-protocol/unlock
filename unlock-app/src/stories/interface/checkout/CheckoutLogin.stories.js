import React from 'react'
import { storiesOf } from '@storybook/react'
import { CheckoutLogin } from '../../../components/interface/checkout/CheckoutLogin'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import doNothing from '../../../utils/doNothing'

storiesOf('CheckoutLogin', module)
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
    return (
      <CheckoutLogin
        errors={[]}
        close={doNothing}
        loginCredentials={doNothing}
      />
    )
  })
  .add('With errors', () => {
    return (
      <CheckoutLogin
        errors={[{}, {}]}
        close={doNothing}
        loginCredentials={doNothing}
      />
    )
  })
