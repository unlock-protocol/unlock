import React from 'react'
import PropTypes from 'prop-types'

const SvgHamburger = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3zm0 18a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3zm0 18a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3z"
    />
  </svg>
)

SvgHamburger.propTypes = {
  title: PropTypes.string,
}
SvgHamburger.defaultProps = {
  title: '',
}
export default SvgHamburger
