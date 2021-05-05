import * as React from 'react'
import PropTypes from 'prop-types'

const SvgHamburger = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3a3 3 0 013-3h56a3 3 0 110 6H3a3 3 0 01-3-3zm0 18a3 3 0 013-3h56a3 3 0 110 6H3a3 3 0 01-3-3zm0 18a3 3 0 013-3h56a3 3 0 110 6H3a3 3 0 01-3-3z"
    />
  </svg>
)

SvgHamburger.propTypes = {
  title: PropTypes.string,
}
SvgHamburger.defaultProps = {
  title: '',
}
export default SvgHamburger
