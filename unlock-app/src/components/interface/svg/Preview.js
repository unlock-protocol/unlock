import React from 'react'

const SvgPreview = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      d="M5 12s2.545-5 7-5 7 5 7 5-2.545 5-7 5-7-5-7-5zm5.091 0a1.909 1.875 0 1 0 3.818 0 1.909 1.875 0 1 0-3.818 0"
    />
  </svg>
)

export default SvgPreview
