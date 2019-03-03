import React from 'react'
import Paywall from '../components/Paywall'
import BrowserOnly from '../components/helpers/BrowserOnly'

export default function NextPaywall() {
  return (
    <div>
      <BrowserOnly>
        <Paywall />
      </BrowserOnly>
    </div>
  )
}
