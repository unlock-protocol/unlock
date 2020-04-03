import * as React from 'react'
import PropTypes from 'prop-types'

const SvgCarret = ({ title, titleId, ...props }) => (
  <svg aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M0 0h12L6 8 0 0z" />
  </svg>
)

SvgCarret.propTypes = {
  title: PropTypes.string,
}
SvgCarret.defaultProps = {
  title: '',
}
export default SvgCarret
