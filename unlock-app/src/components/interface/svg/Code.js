import React from 'react';

const SvgCode = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.159 6l-5 12-.924-.385 5-12L15.16 6zm3.682 6l-2.72 3.175.759.65L20.159 12l-3.28-3.825-.759.65L18.841 12zM7.88 8.825L5.159 12l2.72 3.175-.759.65L3.841 12l3.28-3.825.759.65z"
    />
  </svg>
);

export default SvgCode;
