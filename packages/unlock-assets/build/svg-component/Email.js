import * as React from 'react'
import PropTypes from 'prop-types'

const SvgEmail = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.044 7.705A1 1 0 005 8v7a2 2 0 002 2h10a2 2 0 002-2V8a.998.998 0 00-.044-.295.497.497 0 01-.171.206l-5.931 4.106a1.5 1.5 0 01-1.708 0l-5.93-4.106a.498.498 0 01-.172-.206zm13.25-.66A1 1 0 0018 7H6a1 1 0 00-.295.044.503.503 0 01.08.045l5.93 4.106a.5.5 0 00.57 0l5.93-4.106a.502.502 0 01.08-.045z"
    />
  </svg>
)

SvgEmail.propTypes = {
  title: PropTypes.string,
}
SvgEmail.defaultProps = {
  title: '',
}
export default SvgEmail
