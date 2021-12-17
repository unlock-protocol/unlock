import React from 'react'
import { useRouter } from 'next/router'
import CheckoutContent from '../components/content/CheckoutContent'
import BrowserOnly from '../components/helpers/BrowserOnly'

const Checkout = () => {
  const { query } = useRouter()

  return (
    <BrowserOnly>
      <CheckoutContent query={query} />
    </BrowserOnly>
  )
}

export async function getStaticProps() {
  // Disabling auto login for the checkout page because it messes withe the need to sign a message for some implementations...
  return {
    props: { skipAutoLogin: true },
  }
}
export default Checkout
