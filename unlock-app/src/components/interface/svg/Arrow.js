import React from 'react'

const SvgArrow = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.5 12a.5.5 0 0 1-.175.38l-3.5 3a.5.5 0 1 1-.65-.76l2.473-2.12H7a.5.5 0 0 1 0-1h8.648l-2.473-2.12a.5.5 0 1 1 .65-.76l3.5 3a.5.5 0 0 1 .175.38z"
    />
  </svg>
)

export default SvgArrow
