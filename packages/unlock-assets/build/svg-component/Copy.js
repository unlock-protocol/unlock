import * as React from 'react'
import PropTypes from 'prop-types'

const SvgCopy = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 6v1h4V6h-4zm5 4.5a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 2a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 2a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zM8 17h8V7h-1v1H9V7H8v10zm2-12a1 1 0 00-1 1H8a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1h-1a1 1 0 00-1-1h-4z"
    />
  </svg>
)

SvgCopy.propTypes = {
  title: PropTypes.string,
}
SvgCopy.defaultProps = {
  title: '',
}
export default SvgCopy
