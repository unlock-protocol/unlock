import React from 'react'
import PropTypes from 'prop-types'

const SvgTicket = ({ title, ...props }) => (
  <svg {...props}>
    {title ? <title>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23 19.853h-.733c-.406 0-.734.355-.734.794 0 .44.328.794.734.794H23v3.383c0 .876-.657 1.588-1.467 1.588H2.467C1.657 26.412 1 25.7 1 24.824V21.44h.733c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H1V2.588C1 1.712 1.657 1 2.467 1h19.066C22.343 1 23 1.712 23 2.588v17.265zM4.667 21.44h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H4.667c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H9.067c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794h-1.466c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794h-1.466c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zM5 3.5A1.5 1.5 0 003.5 5v9A1.5 1.5 0 005 15.5h14a1.5 1.5 0 001.5-1.5V5A1.5 1.5 0 0019 3.5H5zM4.5 5a.5.5 0 01.5-.5h14a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5V5z"
    />
  </svg>
)

SvgTicket.propTypes = {
  title: PropTypes.string,
}
SvgTicket.defaultProps = {
  title: '',
}
export default SvgTicket
