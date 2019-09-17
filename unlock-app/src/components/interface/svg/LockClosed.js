import React from 'react'
import PropTypes from 'prop-types'

const SvgLockClosed = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 7.667C9.5 6.524 10.562 5.5 12 5.5s2.5 1.024 2.5 2.167V9h-5V7.667zM8.5 9H7a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1v-8a1 1 0 00-1-1h-1.5V7.667C15.5 5.864 13.876 4.5 12 4.5S8.5 5.864 8.5 7.667V9zM7 18h10v-8H7v8zm3-4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"
    />
  </svg>
)

SvgLockClosed.propTypes = {
  title: PropTypes.string,
}
SvgLockClosed.defaultProps = {
  title: '',
}
export default SvgLockClosed
