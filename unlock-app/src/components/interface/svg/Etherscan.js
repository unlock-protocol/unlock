import React from 'react'

const SvgEtherscan = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 6a.5.5 0 0 1 .5-.5h3.5a.5.5 0 0 1 0 1h-3v2.75a.5.5 0 0 1-1 0V6zM14 6a.5.5 0 0 1 .5-.5H18a.5.5 0 0 1 .5.5v3.25a.5.5 0 0 1-1 0V6.5h-3A.5.5 0 0 1 14 6zM8.5 8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm2 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm1.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3.5-.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM6 14.25a.5.5 0 0 1 .5.5v2.75h3a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5v-3.25a.5.5 0 0 1 .5-.5zm12 0a.5.5 0 0 1 .5.5V18a.5.5 0 0 1-.5.5h-3.5a.5.5 0 0 1 0-1h3v-2.75a.5.5 0 0 1 .5-.5z"
    />
  </svg>
)

export default SvgEtherscan
