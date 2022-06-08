import * as React from 'react'
import PropTypes from 'prop-types'

const SvgEtherscan = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 6.5A1.5 1.5 0 0 1 6.5 5H9a.5.5 0 0 1 0 1H6.5a.5.5 0 0 0-.5.5v2.25a.5.5 0 0 1-1 0V6.5Zm9.5-1A.5.5 0 0 1 15 5h2.5A1.5 1.5 0 0 1 19 6.5v2.25a.5.5 0 0 1-1 0V6.5a.5.5 0 0 0-.5-.5H15a.5.5 0 0 1-.5-.5ZM8.5 8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5Zm2 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5ZM12 9a1 1 0 1 1 2 0v6a1 1 0 1 1-2 0V9Zm3.5-1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5Zm-10 6.75a.5.5 0 0 1 .5.5v2.25a.5.5 0 0 0 .5.5H9a.5.5 0 0 1 0 1H6.5A1.5 1.5 0 0 1 5 17.5v-2.25a.5.5 0 0 1 .5-.5Zm13 0a.5.5 0 0 1 .5.5v2.25a1.5 1.5 0 0 1-1.5 1.5H15a.5.5 0 0 1 0-1h2.5a.5.5 0 0 0 .5-.5v-2.25a.5.5 0 0 1 .5-.5Z"
    />
  </svg>
)

SvgEtherscan.propTypes = {
  title: PropTypes.string,
}
SvgEtherscan.defaultProps = {
  title: '',
}
export default SvgEtherscan
