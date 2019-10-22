import React from 'react'
import PropTypes from 'prop-types'

const SvgKey = ({ title, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <title>{title}</title>
    <path
      d="M6.424 12.89a3.417 3.417 0 013.892-.66l6.614-6.614 1.616 1.616-.808.809 1.616 1.616-1.616 1.616-1.616-1.616-4.19 4.19a3.417 3.417 0 01-3.083 4.895 3.428 3.428 0 01-2.425-5.853zm3.233 3.232a1.145 1.145 0 000-1.616 1.145 1.145 0 00-1.616 0 1.145 1.145 0 000 1.616 1.145 1.145 0 001.616 0z"
      fill="#000"
    />
    <path
      d="M15.314 10.465l1.616 1.616-1.616 1.617-1.617-1.617 1.617-1.616z"
      fill="#000"
    />
  </svg>
)

SvgKey.propTypes = {
  title: PropTypes.string,
}
SvgKey.defaultProps = {
  title: '',
}
export default SvgKey
