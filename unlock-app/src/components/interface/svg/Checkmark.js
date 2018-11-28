import React from 'react'

const SvgCheckmark = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path
      d="M1 5.587l3.236 2.482L9.556 1"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default SvgCheckmark
