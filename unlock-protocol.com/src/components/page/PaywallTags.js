import PropTypes from 'prop-types'
import React from 'react'

export const PaywallTags = ({ lock }) => {
  if (lock) {
    return (
      <>
        <script
          src="https://paywall.unlock-protocol.com/static/paywall.min.js"
          data-unlock-url="https://paywall.unlock-protocol.com"
        />
        <meta name="lock" content={lock} />
      </>
    )
  } else {
    return <></>
  }
}

PaywallTags.propTypes = {
  lock: PropTypes.string,
}

PaywallTags.defaultProps = {
  lock: null,
}

export default PaywallTags
