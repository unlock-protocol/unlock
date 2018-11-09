import React from 'react'

const SvgLemniscate = props => (
  <svg {...props}>
    <text
      fill="#333"
      fillRule="evenodd"
      fontFamily="IBMPlexMono-Light, IBM Plex Mono Light"
      fontSize={16}
      letterSpacing={-3.2}
    >
      <tspan x={0.044} y={10}>
        {'o'}
      </tspan>
      <tspan x={6.444} y={10} letterSpacing={-0.044}>
        {'o'}
      </tspan>
    </text>
  </svg>
)

export default SvgLemniscate
