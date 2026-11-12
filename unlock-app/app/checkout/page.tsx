import React from 'react'
import { Metadata } from 'next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'

export const metadata: Metadata = {
  title: 'Checkout | Unlock Protocol',
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
