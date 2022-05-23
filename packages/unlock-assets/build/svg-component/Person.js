import * as React from 'react'
import PropTypes from 'prop-types'

const SvgPerson = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M9.5.333c2.578 0 4.677 2.005 4.677 4.465 0 2.461-2.1 4.466-4.677 4.466-2.578 0-4.677-2.005-4.677-4.466 0-2.46 2.1-4.465 4.677-4.465Zm0 21.334c-3.518 0-6.64-1.512-8.74-3.893-.395-.447-.539-1.089-.205-1.583 1.48-2.19 6.225-3.454 8.945-3.454 2.72 0 7.465 1.265 8.945 3.454.334.494.19 1.136-.204 1.583-2.1 2.38-5.223 3.893-8.741 3.893Z" />
  </svg>
)

SvgPerson.propTypes = {
  title: PropTypes.string,
}
SvgPerson.defaultProps = {
  title: '',
}
export default SvgPerson
