import React from 'react'
import PropTypes from 'prop-types'

const SvgCoinbaseWallet = ({ title, ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" {...props}>
    <title>{title}</title>
    <path
      d="M60 108.75c26.924 0 48.75-21.826 48.75-48.75S86.924 11.25 60 11.25 11.25 33.076 11.25 60 33.076 108.75 60 108.75z"
      fill="#fff"
    />
    <path
      d="M111 0H9C4.02 0 0 4.02 0 9v102c0 4.98 4.02 9 9 9h102c4.98 0 9-4.02 9-9V9c0-4.98-4.02-9-9-9zM60 101.82c-23.1 0-41.82-18.72-41.82-41.82S36.9 18.18 60 18.18 101.82 36.9 101.82 60 83.1 101.82 60 101.82zm12.09-55.11H47.91c-.66 0-1.2.54-1.2 1.2v24.18c0 .66.54 1.2 1.2 1.2h24.18c.66 0 1.2-.54 1.2-1.2V47.91c0-.66-.54-1.2-1.2-1.2z"
      fill="url(#coinbase-wallet_svg__paint0_linear)"
    />
    <defs>
      <linearGradient
        id="coinbase-wallet_svg__paint0_linear"
        x1={60}
        y1={8.045}
        x2={60}
        y2={113.754}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.002} stopColor="#2E66F9" />
        <stop offset={1} stopColor="#124BDC" />
      </linearGradient>
    </defs>
  </svg>
)

SvgCoinbaseWallet.propTypes = {
  title: PropTypes.string,
}
SvgCoinbaseWallet.defaultProps = {
  title: '',
}
export default SvgCoinbaseWallet
