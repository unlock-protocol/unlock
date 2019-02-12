import React from 'react'
import Paywall from '../src/components/Paywall'
import BrowserOnly from '../src/components/helpers/BrowserOnly'

export default function NextPaywall() {
  return (
    <div>
      <BrowserOnly>
        <Paywall />
      </BrowserOnly>
    </div>
  )
}
