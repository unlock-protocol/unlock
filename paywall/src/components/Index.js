import React from 'react'
import PropTypes from 'prop-types'

import Paywall from './Paywall'
import BrowserOnly from './helpers/BrowserOnly'
import LandingPage from './LandingPage'

export default function Index({ path }) {
  if (path === '/') return <LandingPage />
  return (
    <div>
      <BrowserOnly>
        <Paywall />
      </BrowserOnly>
    </div>
  )
}

Index.propTypes = {
  path: PropTypes.string.isRequired,
}
