import React from 'react'
import PropTypes from 'prop-types'

const SvgIconCheckmark = ({ title, ...props }) => (
  <svg viewBox="0 0 92 92" fill="none" {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M46 92c25.405 0 46-20.595 46-46S71.405 0 46 0 0 20.595 0 46s20.595 46 46 46z"
      fill="#EEE"
    />
    <path
      d="M30.667 48.25l12.404 9.515 20.395-27.098"
      stroke="#A6A6A6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

SvgIconCheckmark.propTypes = {
  title: PropTypes.string,
}
SvgIconCheckmark.defaultProps = {
  title: '',
}
export default SvgIconCheckmark
