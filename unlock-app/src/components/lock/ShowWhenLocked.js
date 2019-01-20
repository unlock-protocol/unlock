import PropTypes from 'prop-types'
import React from 'react'

import SuspendedRender from '../helpers/SuspendedRender'

export default function ShowWhenLocked({ locked, children }) {
  // We have at least one valid key and the modal was not shown
  if (!locked) {
    return null
  }

  // There is no valid key or we shown the modal previously
  return <SuspendedRender>{children}</SuspendedRender>
}

ShowWhenLocked.propTypes = {
  locked: PropTypes.bool,
  children: PropTypes.node,
}

ShowWhenLocked.defaultProps = {
  children: null,
  locked: false,
}
