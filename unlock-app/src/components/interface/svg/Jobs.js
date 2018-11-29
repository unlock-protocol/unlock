import React from 'react'

const SvgJobs = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 5h-2a2 2 0 0 0-2 2H6a1 1 0 0 0-1 1v2h14V8a1 1 0 0 0-1-1h-3a2 2 0 0 0-2-2zm1 2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1h4z"
    />
    <path d="M5 11h14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5z" />
  </svg>
)

export default SvgJobs
