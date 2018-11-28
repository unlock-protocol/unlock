import React from 'react'

const SvgLog = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 1V0h7v1H3zm7 3H3V3h7v1zM3 7h7V6H3v1zm7 3H3V9h7v1zM0 4h2V3H0v1zm0-3V0h2v1H0zm0 6h2V6H0v1zm2 3H0V9h2v1z"
      fill="#000"
    />
  </svg>
)

export default SvgLog
