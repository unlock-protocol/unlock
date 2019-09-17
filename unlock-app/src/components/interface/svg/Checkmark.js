import React from 'react'
import PropTypes from 'prop-types'

const SvgCheckmark = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.857 7.6a.5.5 0 01.099.7l-5.32 7.07a.5.5 0 01-.704.096l-3.236-2.482a.5.5 0 11.608-.794l2.836 2.175L16.157 7.7a.5.5 0 01.7-.098z"
    />
  </svg>
)

SvgCheckmark.propTypes = {
  title: PropTypes.string,
}
SvgCheckmark.defaultProps = {
  title: '',
}
export default SvgCheckmark
