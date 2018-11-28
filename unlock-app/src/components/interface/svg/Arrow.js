import React from 'react'

const SvgArrow = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path
      d="M7.5 1L11 4m0 0L7.5 7M11 4H1"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default SvgArrow
