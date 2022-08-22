import React from 'react'
import { useRouter } from 'next/router'
import CheckoutContent from '~/components/content/CheckoutContent'
import BrowserOnly from '~/components/helpers/BrowserOnly'

const Checkout = () => {
  const { query } = useRouter()

  return (
    <BrowserOnly>
      <CheckoutContent query={query} />
    </BrowserOnly>
  )
}

export default Checkout
