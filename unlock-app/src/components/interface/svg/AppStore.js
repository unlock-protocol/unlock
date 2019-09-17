import React from 'react'
import PropTypes from 'prop-types'

const SvgAppStore = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.766 4.56a.5.5 0 01.472 0l5.998 3.215a.5.5 0 01.264.441v7.566a.5.5 0 01-.264.44l-6 3.219a.5.5 0 01-.474 0l-5.999-3.222a.5.5 0 01-.263-.441l.004-7.562a.5.5 0 01.264-.44l5.998-3.217zM6.504 9.04l4.995 2.609v6.515L6.5 15.479l.004-6.438zm5.995 9.125l5.001-2.682V9.041l-5.001 2.608v6.516zm-.5-7.383L16.93 8.21l-4.928-2.643L7.073 8.21 12 10.782z"
    />
  </svg>
)

SvgAppStore.propTypes = {
  title: PropTypes.string,
}
SvgAppStore.defaultProps = {
  title: '',
}
export default SvgAppStore
