import * as React from 'react'
import PropTypes from 'prop-types'

const SvgUpload = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.38 3.175a.5.5 0 00-.76 0l-2 2.333a.5.5 0 00.76.65l1.12-1.306V12.5a.5.5 0 001 0V4.852l1.12 1.307a.5.5 0 10.76-.651l-2-2.333zM6.5 9a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-8a.5.5 0 00-.5-.5h-3a.5.5 0 000 1H17v7H7v-7h2.5a.5.5 0 000-1h-3z"
    />
  </svg>
)

SvgUpload.propTypes = {
  title: PropTypes.string,
}
SvgUpload.defaultProps = {
  title: '',
}
export default SvgUpload
