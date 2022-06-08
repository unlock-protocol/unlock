import * as React from 'react'
import PropTypes from 'prop-types'

const SvgEth = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 6V5h5v1H1Zm-1 5v-1h7v1H0ZM0 1V0h7v1H0Z"
    />
  </svg>
)

SvgEth.propTypes = {
  title: PropTypes.string,
}
SvgEth.defaultProps = {
  title: '',
}
export default SvgEth
