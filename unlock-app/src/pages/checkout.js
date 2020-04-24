import React from 'react'
import CheckoutContent from '../components/content/CheckoutContent'
import BrowserOnly from '../components/helpers/BrowserOnly'

const Checkout = () => (
  <BrowserOnly>
    <CheckoutContent />
  </BrowserOnly>
)

export default Checkout
