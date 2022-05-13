import * as React from 'react'
import PropTypes from 'prop-types'

const SvgCart = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 .5a.5.5 0 0 0 0 1h2.257l.317 1.589L4.64 9.746a.51.51 0 0 0 .003.019l.212 1.059a2.5 2.5 0 0 0 2.451 2.01h8.36a.5.5 0 1 0 0-1h-8.36a1.5 1.5 0 0 1-1.47-1.207l-.093-.46h8.78a2.5 2.5 0 0 0 2.488-2.252l.486-4.865A.5.5 0 0 0 17 2.5H4.477L4.157.902A.5.5 0 0 0 3.667.5H1Zm4.56 8.667L4.653 3.5h11.795l-.432 4.316a1.5 1.5 0 0 1-1.493 1.35H5.56Zm-1.06 6.5a1.833 1.833 0 1 1 3.667 0 1.833 1.833 0 0 1-3.667 0Zm1.833-.834a.833.833 0 1 0 0 1.667.833.833 0 0 0 0-1.667Zm6.167.834a1.833 1.833 0 1 1 3.667 0 1.833 1.833 0 0 1-3.667 0Zm1.833-.834a.833.833 0 1 0 0 1.667.833.833 0 0 0 0-1.667Z"
    />
  </svg>
)

SvgCart.propTypes = {
  title: PropTypes.string,
}
SvgCart.defaultProps = {
  title: '',
}
export default SvgCart
