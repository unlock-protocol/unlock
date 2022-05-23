import * as React from 'react'
import PropTypes from 'prop-types'

const SvgLiveDemo = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <mask id="live-demo_svg__a" fill="#fff">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.846 7.385a1 1 0 0 0-1 1v17.487a1 1 0 0 0 1 1h17.487a1 1 0 0 0 1-1V8.385a1 1 0 0 0-1-1H10.846Zm0 27.282a1 1 0 0 0-1 1v17.487a1 1 0 0 0 1 1h17.487a1 1 0 0 0 1-1V35.667a1 1 0 0 0-1-1H10.846ZM37.128 8.385a1 1 0 0 1 1-1h17.487a1 1 0 0 1 1 1v17.487a1 1 0 0 1-1 1H38.128a1 1 0 0 1-1-1V8.385Zm1 26.282a1 1 0 0 0-1 1v17.487a1 1 0 0 0 1 1h17.487a1 1 0 0 0 1-1V35.667a1 1 0 0 0-1-1H38.128Z"
      />
    </mask>
    <path
      d="M11.846 8.385a1 1 0 0 1-1 1v-4a3 3 0 0 0-3 3h4Zm0 17.487V8.385h-4v17.487h4Zm-1-1a1 1 0 0 1 1 1h-4a3 3 0 0 0 3 3v-4Zm17.487 0H10.846v4h17.487v-4Zm-1 1a1 1 0 0 1 1-1v4a3 3 0 0 0 3-3h-4Zm0-17.487v17.487h4V8.385h-4Zm1 1a1 1 0 0 1-1-1h4a3 3 0 0 0-3-3v4Zm-17.487 0h17.487v-4H10.846v4Zm1 26.282a1 1 0 0 1-1 1v-4a3 3 0 0 0-3 3h4Zm0 17.487V35.667h-4v17.487h4Zm-1-1a1 1 0 0 1 1 1h-4a3 3 0 0 0 3 3v-4Zm17.487 0H10.846v4h17.487v-4Zm-1 1a1 1 0 0 1 1-1v4a3 3 0 0 0 3-3h-4Zm0-17.487v17.487h4V35.667h-4Zm1 1a1 1 0 0 1-1-1h4a3 3 0 0 0-3-3v4Zm-17.487 0h17.487v-4H10.846v4ZM38.128 5.385a3 3 0 0 0-3 3h4a1 1 0 0 1-1 1v-4Zm17.487 0H38.128v4h17.487v-4Zm3 3a3 3 0 0 0-3-3v4a1 1 0 0 1-1-1h4Zm0 17.487V8.385h-4v17.487h4Zm-3 3a3 3 0 0 0 3-3h-4a1 1 0 0 1 1-1v4Zm-17.487 0h17.487v-4H38.128v4Zm-3-3a3 3 0 0 0 3 3v-4a1 1 0 0 1 1 1h-4Zm0-17.487v17.487h4V8.385h-4Zm4 27.282a1 1 0 0 1-1 1v-4a3 3 0 0 0-3 3h4Zm0 17.487V35.667h-4v17.487h4Zm-1-1a1 1 0 0 1 1 1h-4a3 3 0 0 0 3 3v-4Zm17.487 0H38.128v4h17.487v-4Zm-1 1a1 1 0 0 1 1-1v4a3 3 0 0 0 3-3h-4Zm0-17.487v17.487h4V35.667h-4Zm1 1a1 1 0 0 1-1-1h4a3 3 0 0 0-3-3v4Zm-17.487 0h17.487v-4H38.128v4Z"
      mask="url(#live-demo_svg__a)"
    />
    <path
      d="m30.618 34.281 7.514-.009c1.356-.002 2.014-1.658 1.03-2.59l-20.4-19.302c-.957-.905-2.531-.227-2.531 1.09v27.554c0 1.321 1.584 1.997 2.538 1.083l5.498-5.274 4.342 9.896a1.5 1.5 0 0 0 1.927.791l3.554-1.41a1.5 1.5 0 0 0 .821-1.995l-4.293-9.834Z"
      stroke="#fff"
      strokeWidth={2}
    />
  </svg>
)

SvgLiveDemo.propTypes = {
  title: PropTypes.string,
}
SvgLiveDemo.defaultProps = {
  title: '',
}
export default SvgLiveDemo
