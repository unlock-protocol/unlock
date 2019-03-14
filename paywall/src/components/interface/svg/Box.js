import React from 'react'
import PropTypes from 'prop-types'

const SvgBox = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path
      d="M13 4.216v7.566L6.999 15 1 11.778l.004-7.562L7.002 1 13 4.216z"
      fill="#fff"
    />
    <path
      d="M13 4.216l-6.001 3.13M13 4.216L7.002 1 1.004 4.216m11.996 0v7.566L6.999 15m0 0L1 11.778l.004-7.562M7 15V7.346m-5.995-3.13L7 7.346"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

SvgBox.propTypes = {
  title: PropTypes.string,
}
SvgBox.defaultProps = {
  title: '',
}
export default SvgBox
