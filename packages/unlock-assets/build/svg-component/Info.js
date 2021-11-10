import * as React from 'react'
import PropTypes from 'prop-types'

const SvgInfo = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 16 17"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 6.1a.8.8 0 100-1.6.8.8 0 000 1.6zm0 6.4a.667.667 0 00.667-.667v-4a.667.667 0 00-1.333 0v4c0 .368.298.667.666.667z"
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
