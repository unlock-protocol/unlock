import * as React from 'react'
import PropTypes from 'prop-types'

const SvgWalletConnect = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 27 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M5.823 3.126c4.24-4.168 11.114-4.168 15.354 0l.51.502a.527.527 0 010 .754L19.943 6.1a.275.275 0 01-.384 0l-.702-.69c-2.958-2.909-7.754-2.909-10.712 0l-.752.738a.275.275 0 01-.384 0L5.263 4.431a.527.527 0 010-.754l.56-.55zm18.964 3.549l1.554 1.527a.527.527 0 010 .755l-7.005 6.887a.55.55 0 01-.768 0l-4.972-4.888a.137.137 0 00-.192 0l-4.972 4.888a.55.55 0 01-.767 0L.659 8.957a.527.527 0 010-.755l1.554-1.527a.55.55 0 01.767 0l4.972 4.888a.137.137 0 00.192 0l4.972-4.888a.55.55 0 01.768 0l4.972 4.888a.137.137 0 00.192 0l4.972-4.888a.55.55 0 01.767 0z" />
  </svg>
)

SvgWalletConnect.propTypes = {
  title: PropTypes.string,
}
SvgWalletConnect.defaultProps = {
  title: '',
}
export default SvgWalletConnect
