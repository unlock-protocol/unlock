import React from 'react'
import PropTypes from 'prop-types'

export const EventUrl = ({ address }) => {
  if (!address) {
    return <span>...</span>
  }
  const url = 'https://tickets.unlock-protocol.com/event/' + address
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  )
}

EventUrl.propTypes = {
  address: PropTypes.string,
}

EventUrl.defaultProps = {
  address: null,
}

export default EventUrl
