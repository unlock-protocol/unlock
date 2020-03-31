import React from 'react'
import { storiesOf } from '@storybook/react'
import { RecommendedWallets } from '../../../components/interface/checkout/RecommendWallets'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import doNothing from '../../../utils/doNothing'

storiesOf('Recommended Wallets', module)
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
    return <RecommendedWallets />
  })
