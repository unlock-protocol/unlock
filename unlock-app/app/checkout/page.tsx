import React from 'react'
import { Metadata } from 'next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'

// Checkouts that use a saved config (`?id=`) are redirected to `/checkout/<id>`
// by `middleware.ts`; `[id]/page.tsx` serves them and generates their metadata.
// What is served here are checkouts without a saved config id, such as
// `?paywallConfig=` or `?checkoutConfig=`.
export const metadata: Metadata = {
  title: 'Checkout | Unlock Protocol',
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
