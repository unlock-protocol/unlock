import React from 'react'
import PropTypes from 'prop-types'

const SvgEth = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z"
    />
  </svg>
)

SvgEth.propTypes = {
  title: PropTypes.string,
}
SvgEth.defaultProps = {
  title: '',
}
export default SvgEth
