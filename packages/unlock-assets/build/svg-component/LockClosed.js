import * as React from 'react'
import PropTypes from 'prop-types'

const SvgLockClosed = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 7.667C9.5 6.524 10.562 5.5 12 5.5s2.5 1.024 2.5 2.167V9h-5V7.667ZM8.5 9H7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1.5V7.667C15.5 5.864 13.876 4.5 12 4.5S8.5 5.864 8.5 7.667V9ZM7 18h10v-8H7v8Zm3-4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2Z"
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
