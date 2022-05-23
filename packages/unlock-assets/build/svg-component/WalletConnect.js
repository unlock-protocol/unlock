import * as React from 'react'
import PropTypes from 'prop-types'

const SvgWalletConnect = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath="url(#walletConnect_svg__a)">
      <path
        d="M10.033 11.086c3.296-3.226 8.638-3.226 11.934 0l.396.389a.407.407 0 0 1 0 .584l-1.356 1.328a.214.214 0 0 1-.299 0l-.545-.534c-2.3-2.251-6.027-2.251-8.326 0l-.584.572a.214.214 0 0 1-.299 0l-1.356-1.328a.407.407 0 0 1 0-.584l.435-.427Zm14.74 2.748 1.207 1.182a.407.407 0 0 1 0 .584l-5.445 5.33a.428.428 0 0 1-.596 0l-3.864-3.783a.107.107 0 0 0-.15 0l-3.864 3.784a.428.428 0 0 1-.596 0L6.02 15.6a.407.407 0 0 1 0-.584l1.207-1.183a.428.428 0 0 1 .597 0l3.864 3.784c.041.04.108.04.15 0l3.864-3.784a.428.428 0 0 1 .596 0l3.865 3.784c.04.04.107.04.149 0l3.864-3.784a.428.428 0 0 1 .597 0Z"
        fill="#3B99FC"
      />
    </g>
    <defs>
      <clipPath id="walletConnect_svg__a">
        <path fill="#fff" d="M0 0h32v32H0z" />
      </clipPath>
    </defs>
  </svg>
)

SvgWalletConnect.propTypes = {
  title: PropTypes.string,
}
SvgWalletConnect.defaultProps = {
  title: '',
}
export default SvgWalletConnect
