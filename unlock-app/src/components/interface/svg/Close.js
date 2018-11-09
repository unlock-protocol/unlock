import React from 'react'

const SvgClose = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      d="M16.837 16.837a.554.554 0 0 1-.785 0L12 12.785l-4.052 4.052a.554.554 0 0 1-.785 0 .555.555 0 0 1 0-.785L11.214 12 7.163 7.948a.555.555 0 1 1 .785-.786L12 11.215l4.052-4.053a.556.556 0 0 1 .785.786L12.786 12l4.051 4.052a.555.555 0 0 1 0 .785z"
      fillRule="evenodd"
    />
  </svg>
)

export default SvgClose
