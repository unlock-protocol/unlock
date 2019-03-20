import React from 'react'

import PaywallAppContent from '../components/content/PaywallAppContent'
import BrowserOnly from '../components/helpers/BrowserOnly'

export default function Home() {
  return (
    <BrowserOnly>
      <PaywallAppContent />
    </BrowserOnly>
  )
}
