import React from 'react'
import PropTypes from 'prop-types'

const SvgKey = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      d="M3.392 10.021a3.504 3.504 0 013.99-.676l6.782-6.781 1.658 1.657-.829.829 1.657 1.657-1.657 1.657-1.657-1.657-4.296 4.295a3.504 3.504 0 01-3.162 5.021 3.516 3.516 0 01-2.486-6.002zm3.315 3.315c.456-.457.456-1.2 0-1.657a1.174 1.174 0 00-1.658 0 1.174 1.174 0 000 1.657c.457.457 1.201.457 1.658 0z"
      fill="evenodd"
    />
    <path
      d="M12.507 7.535l1.657 1.658-1.657 1.657-1.657-1.657 1.657-1.657z"
      fill="evenodd"
    />
  </svg>
)

SvgKey.propTypes = {
  title: PropTypes.string,
}
SvgKey.defaultProps = {
  title: '',
}
export default SvgKey
