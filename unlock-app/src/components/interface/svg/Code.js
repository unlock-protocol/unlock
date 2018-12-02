import React from 'react'

const SvgCode = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.697 17.808a.5.5 0 0 1-.27-.654l4.616-11.077a.5.5 0 1 1 .923.385l-4.615 11.076a.5.5 0 0 1-.654.27zm6.478-1.928a.5.5 0 0 1-.055-.705L18.841 12l-2.72-3.175a.5.5 0 1 1 .759-.65l3 3.5a.5.5 0 0 1 0 .65l-3 3.5a.5.5 0 0 1-.705.055zM7.88 8.825a.5.5 0 0 0-.76-.65l-3 3.5a.5.5 0 0 0 0 .65l3 3.5a.5.5 0 1 0 .76-.65L5.159 12l2.72-3.175z"
    />
  </svg>
)

export default SvgCode
