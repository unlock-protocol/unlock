import React from 'react'

const SvgEmail = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.044 7.705A1 1 0 0 0 5 8v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a.998.998 0 0 0-.044-.295.497.497 0 0 1-.171.206l-5.931 4.106a1.5 1.5 0 0 1-1.708 0l-5.93-4.106a.498.498 0 0 1-.172-.206zm13.25-.66A1 1 0 0 0 18 7H6a1 1 0 0 0-.295.044.503.503 0 0 1 .08.045l5.93 4.106a.5.5 0 0 0 .57 0l5.93-4.106a.502.502 0 0 1 .08-.045z"
    />
  </svg>
)

export default SvgEmail
