import React from 'react'

import Paywall from '../Paywall'
import BrowserOnly from '../helpers/BrowserOnly'

export default function PaywallContent() {
  return (
    <BrowserOnly>
      <Paywall />
    </BrowserOnly>
  )
}
