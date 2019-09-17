import React from 'react'
import PropTypes from 'prop-types'

const SvgChevronUp = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.965.796a3 3 0 014.07 0l26 24a3 3 0 11-4.07 4.408L29 7.083 5.035 29.204a3 3 0 01-4.07-4.408l26-24z"
    />
  </svg>
)

SvgChevronUp.propTypes = {
  title: PropTypes.string,
}
SvgChevronUp.defaultProps = {
  title: '',
}
export default SvgChevronUp
