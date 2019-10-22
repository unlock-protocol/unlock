import React from 'react'
import PropTypes from 'prop-types'

const SvgKeyText = ({ title, ...props }) => (
  <svg viewBox="0 0 201 245" fill="none" {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M38.46 28.488a8.547 8.547 0 00-8.547 8.547v199.419A8.546 8.546 0 0038.459 245h153.837a8.547 8.547 0 008.547-8.546V37.034a8.547 8.547 0 00-8.547-8.546H38.459zm17.26 60.758a5.698 5.698 0 00-5.698 5.698v3.71a5.698 5.698 0 005.697 5.698h119.316a5.698 5.698 0 005.698-5.698v-3.71a5.698 5.698 0 00-5.698-5.698H55.719zm-5.698-27.693A7.553 7.553 0 0157.574 54H173.18a7.553 7.553 0 010 15.105H57.574a7.553 7.553 0 01-7.552-7.553zm7.552 62.939a7.552 7.552 0 100 15.105H173.18a7.553 7.553 0 100-15.105H57.574zm-7.552 78.045a7.552 7.552 0 017.552-7.552h70.36a7.553 7.553 0 110 15.105h-70.36a7.553 7.553 0 01-7.552-7.553zm7.552-42.799a7.552 7.552 0 100 15.105H173.18a7.553 7.553 0 100-15.105H57.574z"
      fill="#A6A6A6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M42.02 84.04c23.208 0 42.02-18.813 42.02-42.02C84.04 18.813 65.228 0 42.02 0 18.813 0 0 18.813 0 42.02c0 23.208 18.813 42.02 42.02 42.02z"
      fill="#ED6E82"
    />
    <path
      d="M21.488 43.773A11.779 11.779 0 0134.903 41.5L57.7 18.703l5.571 5.57-2.785 2.786 5.57 5.571-5.57 5.572-5.572-5.572-14.44 14.44a11.778 11.778 0 01-2.273 13.416 11.818 11.818 0 11-16.713-16.713zM32.63 54.915a3.946 3.946 0 000-5.571 3.946 3.946 0 00-5.571 0 3.946 3.946 0 000 5.571 3.946 3.946 0 005.57 0z"
      fill="#fff"
    />
    <path
      d="M52.129 35.416l5.571 5.571-5.571 5.571-5.571-5.57 5.57-5.572z"
      fill="#fff"
    />
  </svg>
)

SvgKeyText.propTypes = {
  title: PropTypes.string,
}
SvgKeyText.defaultProps = {
  title: '',
}
export default SvgKeyText
