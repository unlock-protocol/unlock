import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgUnlock = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 56 56"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M42.315 22.461h-1.862v-6.92h-6.919v6.92H22.48v-6.92h-6.918v6.92h-1.877v3.288h1.877v5.18c0 6.481 5.606 11.77 12.485 11.77 6.84 0 12.406-5.289 12.406-11.77v-5.18h1.862Zm-8.78 8.468a5.515 5.515 0 0 1-5.488 5.567 5.583 5.583 0 0 1-5.567-5.567v-5.18h11.054Z" />
  </svg>
)

SvgUnlock.propTypes = {
  title: PropTypes.string,
}
SvgUnlock.defaultProps = {
  title: '',
}
export default SvgUnlock
