import React from 'react'

const SvgCheckmark = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.857 7.6a.5.5 0 0 1 .099.7l-5.32 7.07a.5.5 0 0 1-.704.096l-3.236-2.482a.5.5 0 1 1 .608-.794l2.836 2.175L16.157 7.7a.5.5 0 0 1 .7-.098z"
    />
  </svg>
)

export default SvgCheckmark
