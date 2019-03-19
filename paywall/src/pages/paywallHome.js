import React from 'react'
import PropTypes from 'prop-types'

import PaywallHomeContent from '../components/content/PaywallHomeContent'

export default function PaywallHome({ router }) {
  return <PaywallHomeContent path={router.asPath} />
}

PaywallHome.propTypes = {
  router: PropTypes.shape({
    asPath: PropTypes.string.isRequired,
  }).isRequired,
}
