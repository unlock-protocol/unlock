import * as React from 'react'
import PropTypes from 'prop-types'

const SvgLog = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 8a.5.5 0 010-1h6a.5.5 0 010 1h-6zm6.5 2.5a.5.5 0 01-.5.5h-6a.5.5 0 010-1h6a.5.5 0 01.5.5zm-7 3a.5.5 0 00.5.5h6a.5.5 0 000-1h-6a.5.5 0 00-.5.5zm7 3a.5.5 0 01-.5.5h-6a.5.5 0 010-1h6a.5.5 0 01.5.5zm-10-6a.5.5 0 00.5.5h1a.5.5 0 000-1h-1a.5.5 0 00-.5.5zM7.5 8a.5.5 0 010-1h1a.5.5 0 010 1h-1zM7 13.5a.5.5 0 00.5.5h1a.5.5 0 000-1h-1a.5.5 0 00-.5.5zm2 3a.5.5 0 01-.5.5h-1a.5.5 0 010-1h1a.5.5 0 01.5.5z"
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
