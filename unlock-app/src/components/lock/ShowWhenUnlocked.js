import PropTypes from 'prop-types'
import React from 'react'

export default function ShowWhenUnlocked({ locked, children }) {
  // We have at least one valid key and the modal was not shown
  if (locked) {
    return null
  }

  // There is no valid key or we shown the modal previously
  return <>{children}</>
}

ShowWhenUnlocked.propTypes = {
  locked: PropTypes.bool,
  children: PropTypes.node,
}

ShowWhenUnlocked.defaultProps = {
  children: null,
  locked: false,
}
