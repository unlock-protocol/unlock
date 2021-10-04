import * as React from 'react'
import PropTypes from 'prop-types'

const SvgDownload = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.706 14.294a2.28 2.28 0 01-1.412-.486v1.17c.428.202.907.316 1.412.316.897 0 1.711-.359 2.305-.941h.048v-.048A3.283 3.283 0 0020 12c0-.898-.359-1.711-.941-2.305v-.048h-.048a3.301 3.301 0 00-.896-.625A5.177 5.177 0 007.958 7.77a3.765 3.765 0 10.748 7.406V14.13a2.765 2.765 0 11-.798-5.362 1 1 0 001.013-.727 4.177 4.177 0 018.195 1.01 1 1 0 00.571.874c.232.11.442.258.624.436l.017.016.017.018c.406.414.655.98.655 1.605s-.249 1.19-.655 1.605l-.017.018-.017.016c-.414.406-.98.655-1.605.655zm-5.086 6.031a.5.5 0 00.76 0l2-2.333a.5.5 0 00-.76-.65l-1.12 1.306V11a.5.5 0 00-1 0v7.648l-1.12-1.307a.5.5 0 10-.76.651l2 2.333z"
    />
  </svg>
)

SvgDownload.propTypes = {
  title: PropTypes.string,
}
SvgDownload.defaultProps = {
  title: '',
}
export default SvgDownload
