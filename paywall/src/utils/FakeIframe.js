import React from 'react'
import PropTypes from 'prop-types'

import '../paywall-builder/iframe.css'

export default function FakeIframe({ children, hide }) {
  return (
    <>
      <div className={`unlock start show hide${hide ? '' : ' optimism'}`}>
        {children}
      </div>
    </>
  )
}

FakeIframe.propTypes = {
  children: PropTypes.node.isRequired,
  hide: PropTypes.bool.isRequired,
}
