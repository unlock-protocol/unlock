import React from 'react'
import PropTypes from 'prop-types'

const SvgInfo = ({ title, ...props }) => (
  <svg viewBox="0 0 16 16" fill="none" {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
      fill="#A6A6A6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 5.6A.8.8 0 1 0 8 4a.8.8 0 0 0 0 1.6zM8 12a.667.667 0 0 0 .667-.667v-4a.667.667 0 0 0-1.334 0v4c0 .368.299.667.667.667z"
      fill="#fff"
    />
  </svg>
)

SvgInfo.propTypes = {
  title: PropTypes.string,
}
SvgInfo.defaultProps = {
  title: '',
}
export default SvgInfo
