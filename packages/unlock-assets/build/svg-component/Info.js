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
      d="M8 6.1a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Zm0 6.4a.667.667 0 0 0 .667-.667v-4a.667.667 0 0 0-1.333 0v4c0 .368.298.667.666.667Z"
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
