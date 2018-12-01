import React from 'react'

const SvgUnlock = ({ title, ...props }) => (
  <svg viewBox="0 0 56 56" {...props}>
    <title>{title}</title>
    <path d="M42.315 22.461h-1.862v-6.92h-6.919v6.92H22.48v-6.92h-6.918v6.92h-1.877v3.288h1.877v5.18c0 6.481 5.606 11.77 12.485 11.77 6.84 0 12.406-5.289 12.406-11.77v-5.18h1.862zm-8.78 8.468a5.515 5.515 0 0 1-5.488 5.567 5.583 5.583 0 0 1-5.567-5.567v-5.18h11.054z" />
  </svg>
)

export default SvgUnlock
