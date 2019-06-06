import React from 'react'
import PropTypes from 'prop-types'

const SvgBlog = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.5 8a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zM18 10.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1 0-1h11a.5.5 0 0 1 .5.5zm-12 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5zm8 3a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 .5.5z"
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
