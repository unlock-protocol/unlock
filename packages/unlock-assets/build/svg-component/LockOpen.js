import * as React from 'react'
import PropTypes from 'prop-types'

const SvgLockOpen = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 7.667C9.5 6.524 10.562 5.5 12 5.5c.894 0 1.661.406 2.1.992l.8-.6C14.264 5.043 13.193 4.5 12 4.5c-1.876 0-3.5 1.364-3.5 3.167V9H7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H9.5V7.667ZM7 18h10v-8H7v8Zm5-2.75c-.686 0-1.25-.564-1.25-1.25s.564-1.25 1.25-1.25 1.25.564 1.25 1.25-.564 1.25-1.25 1.25Zm0 .75c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z"
    />
  </svg>
)

SvgLockOpen.propTypes = {
  title: PropTypes.string,
}
SvgLockOpen.defaultProps = {
  title: '',
}
export default SvgLockOpen
