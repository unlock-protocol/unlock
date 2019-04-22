import React from 'react'
import PropTypes from 'prop-types'

export const EventUrl = ({ address }) => {
  if (!address) {
    return <span>...</span>
  }
  return <span>https://tickets.unlock-protocol.com/event/{address}</span>
}

EventUrl.propTypes = {
  address: PropTypes.string,
}

EventUrl.defaultProps = {
  address: null,
}

export default EventUrl
