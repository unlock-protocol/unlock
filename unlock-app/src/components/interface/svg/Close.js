import React from 'react'

const SvgClose = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.237 7.177a.75.75 0 1 0-1.06 1.06L10.939 12l-3.762 3.763a.75.75 0 1 0 1.06 1.06L12 13.061l3.763 3.762a.75.75 0 1 0 1.06-1.06L13.061 12l3.762-3.763a.75.75 0 0 0-1.06-1.06L12 10.939 8.237 7.177z"
    />
  </svg>
)

export default SvgClose
