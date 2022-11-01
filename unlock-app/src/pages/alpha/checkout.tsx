import React from 'react'
import type { NextPage } from 'next'
import { CheckoutPage } from '~/components/interface/checkout'
import BrowserOnly from '~/components/helpers/BrowserOnly'

const Checkout: NextPage = () => {
  return (
    <BrowserOnly>
      <CheckoutPage />
    </BrowserOnly>
  )
}

export default Checkout
