import React from 'react'
import { Metadata } from 'next'
import { CheckoutPage as CheckoutPageComponent } from '~/components/interface/checkout'

// Checkouts that use a saved config (`?id=`) are redirected to `/checkout/<id>`
// (see `redirects()` in next.config.js and `[id]/page.tsx`, which also
// generates their metadata). What is served here are checkouts without a saved
// config id, such as `?paywallConfig=`.
export const metadata: Metadata = {
  title: 'Checkout | Unlock Protocol',
}

const CheckoutPage: React.FC = () => {
  return <CheckoutPageComponent />
}

export default CheckoutPage
