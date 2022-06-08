import * as React from 'react'
import PropTypes from 'prop-types'

const SvgTelegram = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.801 5.065c.152.13.217.292.195.487L15.144 16.7a.482.482 0 0 1-.227.325.953.953 0 0 1-.228.033.613.613 0 0 1-.195-.033l-3.281-1.332-1.755 2.144a.433.433 0 0 1-.357.163.361.361 0 0 1-.163-.032.409.409 0 0 1-.227-.163c-.065-.087-.087-.173-.065-.26V15.01l6.27-7.702-7.764 6.727-2.86-1.17c-.173-.065-.27-.206-.292-.422 0-.174.076-.315.227-.423l12.087-6.955A.4.4 0 0 1 16.54 5c.087 0 .173.022.26.065Z"
    />
  </svg>
)

SvgTelegram.propTypes = {
  title: PropTypes.string,
}
SvgTelegram.defaultProps = {
  title: '',
}
export default SvgTelegram
