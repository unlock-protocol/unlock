import React from 'react'

const Upload = props => (
  <svg
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
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
        d="M17.45 18h-9.9c-.303 0-.55-.23-.55-.514V9.514C7 9.231 7.247 9 7.55 9h3.025c.152 0 .275.115.275.257 0 .142-.123.257-.275.257H7.55v7.972h9.9V9.514h-3.025c-.152 0-.275-.115-.275-.257 0-.142.123-.257.275-.257h3.025c.303 0 .55.23.55.514v7.972c0 .283-.247.514-.55.514zM14.056 7.166a.27.27 0 0 1-.192-.08l-1.165-1.162v7.472a.27.27 0 0 1-.543 0V5.924l-1.165 1.163a.271.271 0 0 1-.384-.383l1.628-1.625a.272.272 0 0 1 .385 0l1.628 1.625a.27.27 0 0 1-.192.462z"
      />
    </g>
  </svg>
)

export default Upload
