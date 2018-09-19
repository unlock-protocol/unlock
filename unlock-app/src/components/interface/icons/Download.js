import React from 'react'

const Download = props => (
  <svg xmlnsXlink="http://www.w3.org/1999/xlink" {...props}>
    <defs>
      <circle id="a" cx={12} cy={12} r={12} />
    </defs>
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <use fill="#EEE" xlinkHref="#a" />
      <g fill="#EEE" mask="url(#b)">
        <path d="M0 0h24v24H0z" />
      </g>
      <path
        fill="#A6A6A6"
        stroke="#979797"
        strokeWidth={0.25}
        d="M16.182 16.283a.453.453 0 0 1-.04.003c-.153 0-.286-.106-.306-.25-.022-.157.099-.3.268-.32 1.757-.204 3.134-1.631 3.134-3.249 0-1.79-1.565-3.246-3.488-3.246a2.03 2.03 0 0 0-.206.01.313.313 0 0 1-.328-.19c-.556-1.477-2.058-2.47-3.736-2.47-2.185 0-3.963 1.655-3.963 3.689 0 .17.016.346.049.533a.285.285 0 0 1-.208.316c-1.04.32-1.739 1.22-1.739 2.242 0 1.303 1.138 2.363 2.538 2.363h.557c.171 0 .31.128.31.286 0 .158-.139.286-.31.286h-.557C6.417 16.286 5 14.969 5 13.35c0-1.187.762-2.244 1.92-2.7a3.46 3.46 0 0 1-.022-.391C6.898 7.91 8.954 6 11.48 6c1.863 0 3.537 1.056 4.238 2.65h.032c2.265 0 4.107 1.712 4.107 3.817 0 1.9-1.614 3.576-3.675 3.816zm-5.392.13l1.329 1.441v-5.233c0-.186.139-.336.31-.336.17 0 .31.15.31.336v5.233l1.328-1.441a.292.292 0 0 1 .438 0 .356.356 0 0 1 0 .475l-1.858 2.014a.309.309 0 0 1-.218.098.309.309 0 0 1-.219-.098l-1.857-2.014a.356.356 0 0 1 0-.475.292.292 0 0 1 .437 0z"
      />
    </g>
  </svg>
)

export default Download
