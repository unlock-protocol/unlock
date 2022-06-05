import * as React from 'react'
import PropTypes from 'prop-types'

const SvgClose = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.237 7.177a.75.75 0 1 0-1.06 1.06L10.939 12l-3.762 3.763a.75.75 0 1 0 1.06 1.06L12 13.061l3.763 3.762a.75.75 0 1 0 1.06-1.06L13.061 12l3.762-3.763a.75.75 0 0 0-1.06-1.06L12 10.939 8.237 7.177Z"
    />
  </svg>
)

SvgClose.propTypes = {
  title: PropTypes.string,
}
SvgClose.defaultProps = {
  title: '',
}
export default SvgClose
