import PropTypes from 'prop-types'
import React from 'react'

export default function ShowWhenUnlocked({ locked, children }) {
  if (locked) {
    return null
  }

  return <React.Fragment>{children}</React.Fragment>
}

ShowWhenUnlocked.propTypes = {
  locked: PropTypes.bool,
  children: PropTypes.node,
}

ShowWhenUnlocked.defaultProps = {
  children: null,
  locked: false,
}
