import React from 'react'

const SvgUpload = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path d="M12.38 3.675a.5.5 0 0 0-.76 0l-2 2.333a.5.5 0 0 0 .76.65l1.12-1.306V13a.5.5 0 0 0 1 0V5.352l1.12 1.307a.5.5 0 1 0 .76-.651l-2-2.333z" />
    <path d="M7 8.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h2.5v8h-9v-8h2a.5.5 0 0 0 0-1H7z" />
  </svg>
)

export default SvgUpload
