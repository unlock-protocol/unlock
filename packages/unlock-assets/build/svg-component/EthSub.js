import * as React from 'react'
import PropTypes from 'prop-types'

const SvgEthSub = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path fillRule="evenodd" d="M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z" />
  </svg>
)

SvgEthSub.propTypes = {
  title: PropTypes.string,
}
SvgEthSub.defaultProps = {
  title: '',
}
export default SvgEthSub
