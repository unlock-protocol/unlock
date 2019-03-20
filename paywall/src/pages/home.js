import React from 'react'
import PropTypes from 'prop-types'

import HomeContent from '../components/content/HomeContent'

export default function Home({ router }) {
  return <HomeContent path={router.asPath} />
}

Home.propTypes = {
  router: PropTypes.shape({
    asPath: PropTypes.string.isRequired,
  }).isRequired,
}
