import * as React from 'react'
import PropTypes from 'prop-types'

const SvgArrow = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.5 12a.5.5 0 01-.175.38l-3.5 3a.5.5 0 11-.65-.76l2.473-2.12H7a.5.5 0 010-1h8.648l-2.473-2.12a.5.5 0 11.65-.76l3.5 3a.5.5 0 01.175.38z"
    />
  </svg>
)

SvgArrow.propTypes = {
  title: PropTypes.string,
}
SvgArrow.defaultProps = {
  title: '',
}
export default SvgArrow
