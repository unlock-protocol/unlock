import React from 'react'
import PropTypes from 'prop-types'

import '../paywall-builder/iframe.css'

export default function FakeIframe({ children, hide }) {
  return (
    <React.Fragment>
      <div className={`unlock start show hide${hide ? '' : ' optimism'}`}>
        {children}
      </div>
    </React.Fragment>
  )
}

FakeIframe.propTypes = {
  children: PropTypes.node.isRequired,
  hide: PropTypes.bool.isRequired,
}
