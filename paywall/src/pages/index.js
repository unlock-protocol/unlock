import React from 'react'
import PropTypes from 'prop-types'

import Index from '../components/Index'

export default function NextPaywall({ router }) {
  return <Index path={router.asPath} />
}

NextPaywall.propTypes = {
  router: PropTypes.shape({
    asPath: PropTypes.string.isRequired,
  }).isRequired,
}
