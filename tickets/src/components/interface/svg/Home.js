import React from 'react'
import PropTypes from 'prop-types'

const SvgHome = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path d="M12.5 5.5c-.195-.192-.805-.192-1 0l-6.351 6.567a.5.5 0 0 0 .351.856h1.214V17.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5v-2.885h3.428V17.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5v-4.577H18.5a.5.5 0 0 0 .351-.856L12.5 5.5z" />
  </svg>
)

SvgHome.propTypes = {
  title: PropTypes.string,
}
SvgHome.defaultProps = {
  title: '',
}
export default SvgHome
