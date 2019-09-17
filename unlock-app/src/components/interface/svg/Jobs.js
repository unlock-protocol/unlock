import React from 'react'
import PropTypes from 'prop-types'

const SvgJobs = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 5h-2a2 2 0 00-2 2H7a2 2 0 00-2 2v1h14V9a2 2 0 00-2-2h-2a2 2 0 00-2-2zm1 2a1 1 0 00-1-1h-2a1 1 0 00-1 1h4zm-9 4h14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z"
    />
  </svg>
)

SvgJobs.propTypes = {
  title: PropTypes.string,
}
SvgJobs.defaultProps = {
  title: '',
}
export default SvgJobs
