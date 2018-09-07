import PropTypes from 'prop-types'
import React from 'react'
import { GLYPHS } from '../../constants'

export function HeaderIcon({ type }) {
  return (
    <img src={GLYPHS[type]} />
  )
}

HeaderIcon.propTypes = {
  type: PropTypes.string,
}

export default HeaderIcon
