import React from 'react';

const SvgBars = ({ title, ...props }) => (
  <svg fill="none" {...props}>
    <title>{title}</title>
    <path d="M0 6h56V0H0v6zm0 18h56v-6H0v6zm0 18h56v-6H0v6z" />
  </svg>
);

export default SvgBars;
