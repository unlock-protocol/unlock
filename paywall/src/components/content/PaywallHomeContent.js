import React from 'react'
import PropTypes from 'prop-types'

import PaywallAppContent from './PaywallAppContent'
import BrowserOnly from '../helpers/BrowserOnly'
import PaywallLandingPageContent from './PaywallLandingPageContent'

export default function IndexContent({ path }) {
  if (path === '/') return <PaywallLandingPageContent />
  return (
    <BrowserOnly>
      <PaywallAppContent />
    </BrowserOnly>
  )
}

IndexContent.propTypes = {
  path: PropTypes.string.isRequired,
}
