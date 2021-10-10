import * as React from 'react'
import PropTypes from 'prop-types'

const SvgExport = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.62 13.825a.5.5 0 00.76 0l2-2.333a.5.5 0 00-.76-.65l-1.12 1.306V4.5a.5.5 0 00-1 0v7.648l-1.12-1.307a.5.5 0 10-.76.651l2 2.333zM7 14a.5.5 0 00-1 0v4.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V14a.5.5 0 00-1 0v4H7v-4z"
    />
  </svg>
)

SvgExport.propTypes = {
  title: PropTypes.string,
}
SvgExport.defaultProps = {
  title: '',
}
export default SvgExport
