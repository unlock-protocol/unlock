import React from 'react'

const Export = props => (
  <svg
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <defs>
      <circle id="a" cx={12} cy={12} r={12} />
      <path
        id="c"
        d="M13.417 14H.583A.584.584 0 0 1 0 13.417V9.333a.292.292 0 1 1 .583 0v4.084h12.834V9.333a.292.292 0 1 1 .583 0v4.084a.584.584 0 0 1-.583.583zm-6.201-3.595l-.006.004a.296.296 0 0 1-.069.05l-.025.017a.29.29 0 0 1-.232 0c-.01-.005-.016-.012-.025-.017a.302.302 0 0 1-.07-.05c0-.002-.003-.002-.005-.004L3.868 7.196a.292.292 0 0 1 .431-.392l2.41 2.65V.292a.292.292 0 1 1 .583 0v9.162L9.7 6.804a.292.292 0 0 1 .432.392l-2.917 3.209z"
      />
    </defs>
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <use fill="#EEE" xlinkHref="#a" />
      <g fill="#EEE" mask="url(#b)">
        <path d="M0 0h24v24H0z" />
      </g>
      <g transform="translate(5 4)">
        <mask id="d" fill="#fff">
          <use xlinkHref="#c" />
        </mask>
        <use
          fill="#A6A6A6"
          stroke="#979797"
          strokeWidth={0.25}
          xlinkHref="#c"
        />
        <g fill="#A6A6A6" mask="url(#d)">
          <path d="M-5-4h24v24H-5z" />
        </g>
      </g>
    </g>
  </svg>
)

export default Export
