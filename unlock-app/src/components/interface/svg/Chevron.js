import React from 'react'

const SvgChevron = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.965.796a3 3 0 0 1 4.07 0l26 24a3 3 0 1 1-4.07 4.408L29 7.083 5.035 29.204a3 3 0 0 1-4.07-4.408l26-24z"
    />
  </svg>
)

export default SvgChevron
