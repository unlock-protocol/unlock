import React from 'react'
import PropTypes from 'prop-types'

const SvgHome = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path d="M7.5.5c-.195-.192-.805-.192-1 0L.149 7.067a.5.5 0 0 0 .351.856h1.214V12.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5V9.615h3.428V12.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5V7.923H13.5a.5.5 0 0 0 .351-.856L7.5.5z" />
  </svg>
)

SvgHome.propTypes = {
  title: PropTypes.string,
}
SvgHome.defaultProps = {
  title: '',
}
export default SvgHome
