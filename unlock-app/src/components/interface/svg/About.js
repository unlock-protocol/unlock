import React from 'react'

const SvgAbout = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 8.4A1.2 1.2 0 1 0 12 6a1.2 1.2 0 0 0 0 2.4zm0 9.6a1 1 0 0 0 1-1v-6a1 1 0 1 0-2 0v6a1 1 0 0 0 1 1z"
    />
  </svg>
)

export default SvgAbout
