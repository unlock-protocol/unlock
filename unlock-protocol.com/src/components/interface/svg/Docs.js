import React from 'react'
import PropTypes from 'prop-types'

const SvgDocs = ({ title, ...props }) => (
  <svg {...props}>
    {title ? <title>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 0a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V1a1 1 0 00-1-1H1zm2 4a1 1 0 010-2h6a1 1 0 110 2H3zM2 7a1 1 0 001 1h6a1 1 0 100-2H3a1 1 0 00-1 1zm1 5a1 1 0 110-2h4a1 1 0 110 2H3z"
    />
  </svg>
)

SvgDocs.propTypes = {
  title: PropTypes.string,
}
SvgDocs.defaultProps = {
  title: '',
}
export default SvgDocs
