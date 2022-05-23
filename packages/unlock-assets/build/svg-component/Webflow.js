import * as React from 'react'
import PropTypes from 'prop-types'

const SvgWebflow = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 25 17"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M18.545 4.97s-2.032 6.246-2.182 6.776C16.303 11.226 14.822 0 14.822 0c-3.463 0-5.304 2.416-6.285 4.97 0 0-2.472 6.265-2.672 6.786-.01-.491-.38-6.728-.38-6.728C5.274 1.895 2.361 0 0 0l2.842 17c3.623-.01 5.575-2.416 6.596-4.98 0 0 2.171-5.528 2.261-5.774C11.72 6.482 13.261 17 13.261 17c3.633 0 5.594-2.249 6.645-4.714L25 0c-3.593 0-5.484 2.406-6.455 4.97Z" />
  </svg>
)

SvgWebflow.propTypes = {
  title: PropTypes.string,
}
SvgWebflow.defaultProps = {
  title: '',
}
export default SvgWebflow
