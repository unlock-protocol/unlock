import * as React from 'react'
import PropTypes from 'prop-types'

const SvgDocs = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 0a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1Zm2 4a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2H3ZM2 7a1 1 0 0 0 1 1h6a1 1 0 1 0 0-2H3a1 1 0 0 0-1 1Zm1 5a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2H3Z"
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
