import * as React from 'react'
import PropTypes from 'prop-types'

const SvgFirebase = ({ title, titleId, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="23 4 97 136"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="#aaa"
      d="M23.833 111.719L39.966 8.49a2.98 2.98 0 015.57-.946L62.22 38.662 68.87 26a2.98 2.98 0 015.273 0l45.023 85.719H23.833z"
    />
    <path
      fill="#929292"
      d="M79.566 71.507l-17.354-32.86-38.379 73.072 55.733-40.212z"
    />
    <path
      fill="#C8C8C8"
      d="M119.167 111.719l-12.356-76.46c-.187-1.099-.97-2-2.032-2.34s-2.222-.058-3.01.73l-77.936 78.069L66.957 135.9a8.937 8.937 0 008.714 0l43.496-24.183z"
    />
  </svg>
)

SvgFirebase.propTypes = {
  title: PropTypes.string,
}
SvgFirebase.defaultProps = {
  title: '',
}
export default SvgFirebase
