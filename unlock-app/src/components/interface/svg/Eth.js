import React from 'react'

const SvgEth = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z"
    />
  </svg>
)

export default SvgEth
