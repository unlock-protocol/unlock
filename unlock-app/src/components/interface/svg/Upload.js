import React from 'react'

const SvgUpload = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.38 3.175a.5.5 0 0 0-.76 0l-2 2.333a.5.5 0 0 0 .76.65l1.12-1.306V12.5a.5.5 0 0 0 1 0V4.852l1.12 1.307a.5.5 0 1 0 .76-.651l-2-2.333zM6.5 9a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1H17v7H7v-7h2.5a.5.5 0 0 0 0-1h-3z"
    />
  </svg>
)

export default SvgUpload
