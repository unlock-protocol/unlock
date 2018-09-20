import React from 'react'

const Withdraw = props => (
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
        d="M12.5 4.929a5.572 5.572 0 1 0 0 11.143 5.572 5.572 0 0 0 0-11.143zm0-.929a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"
      />
      <path fill="#EEE" d="M10 15h5v3h-5z" />
      <path
        fill="#A6A6A6"
        stroke="#979797"
        strokeWidth={0.25}
        d="M10.79 18.413l1.329 1.441v-5.233c0-.186.139-.336.31-.336.17 0 .31.15.31.336v5.233l1.328-1.441a.292.292 0 0 1 .438 0 .356.356 0 0 1 0 .475l-1.858 2.014a.309.309 0 0 1-.218.098.309.309 0 0 1-.219-.098l-1.857-2.014a.356.356 0 0 1 0-.475.292.292 0 0 1 .437 0z"
      />
      <path
        stroke="#A6A6A6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 11.73c0 .687.668 1.244 1.493 1.244.825 0 1.494-.557 1.494-1.244 0-.687-.669-1.243-1.494-1.243S11 9.93 11 9.243C11 8.557 11.668 8 12.493 8c.825 0 1.494.557 1.494 1.243M12.5 7.5v6"
      />
    </g>
  </svg>
)

export default Withdraw
