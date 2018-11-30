import React from 'react';

const SvgChevronUp = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path d="M3 29L29 5l26 24" />
  </svg>
);

export default SvgChevronUp;
