import * as React from 'react'
import PropTypes from 'prop-types'

const SvgBars = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M0 6h56V0H0v6Zm0 18h56v-6H0v6Zm0 18h56v-6H0v6Z" />
  </svg>
)

SvgBars.propTypes = {
  title: PropTypes.string,
}
SvgBars.defaultProps = {
  title: '',
}
export default SvgBars
