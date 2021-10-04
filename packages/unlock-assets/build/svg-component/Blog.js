import * as React from 'react'
import PropTypes from 'prop-types'

const SvgBlog = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      clipRule="evenodd"
      d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
      fill="none"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 7a1 1 0 00-1-1H6a1 1 0 00-1 1v10a1 1 0 001 1h5v2a.5.5 0 00.8.4L15 18h3a1 1 0 001-1V7zM8 10a1 1 0 001 1h6a1 1 0 100-2H9a1 1 0 00-1 1zm1 5a1 1 0 110-2h6a1 1 0 110 2H9z"
    />
  </svg>
)

SvgBlog.propTypes = {
  title: PropTypes.string,
}
SvgBlog.defaultProps = {
  title: '',
}
export default SvgBlog
