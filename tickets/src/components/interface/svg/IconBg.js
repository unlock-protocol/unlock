import React from 'react'
import PropTypes from 'prop-types'

const SvgIconBg = ({ title, ...props }) => (
  <svg viewBox="0 0 92 92" fill="none" {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M46 92c25.405 0 46-20.595 46-46S71.405 0 46 0 0 20.595 0 46s20.595 46 46 46z"
      fill="#EEE"
    />
  </svg>
)

SvgIconBg.propTypes = {
  title: PropTypes.string,
}
SvgIconBg.defaultProps = {
  title: '',
}
export default SvgIconBg
