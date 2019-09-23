import React from 'react'
import PropTypes from 'prop-types'

const SvgAbout = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 8.4A1.2 1.2 0 1012 6a1.2 1.2 0 000 2.4zm0 9.6a1 1 0 001-1v-6a1 1 0 10-2 0v6a1 1 0 001 1z"
    />
  </svg>
)

SvgAbout.propTypes = {
  title: PropTypes.string,
}
SvgAbout.defaultProps = {
  title: '',
}
export default SvgAbout
