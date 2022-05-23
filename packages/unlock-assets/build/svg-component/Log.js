import * as React from 'react'
import PropTypes from 'prop-types'

const SvgLog = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 8a.5.5 0 0 1 0-1h6a.5.5 0 0 1 0 1h-6Zm6.5 2.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h6a.5.5 0 0 1 .5.5Zm-7 3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 0-1h-6a.5.5 0 0 0-.5.5Zm7 3a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h6a.5.5 0 0 1 .5.5Zm-10-6a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-.5.5ZM7.5 8a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1ZM7 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-.5.5Zm2 3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5Z"
    />
  </svg>
)

SvgLog.propTypes = {
  title: PropTypes.string,
}
SvgLog.defaultProps = {
  title: '',
}
export default SvgLog
