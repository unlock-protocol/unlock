import PropTypes from 'prop-types'
import React from 'react'

import SuspendedRender from '../helpers/SuspendedRender'

export default function ShowWhenLocked({ locked, children }) {
  if (!locked) {
    return null
  }

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
