import React from 'react';

const SvgClose = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.06 12l4.47-4.47-1.06-1.06L12 10.94 7.53 6.47 6.47 7.53 10.94 12l-4.47 4.47 1.06 1.06L12 13.06l4.47 4.47 1.06-1.06L13.06 12z"
    />
  </svg>
);

export default SvgClose;
