import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgLock = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="-15 -4 120 120"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M84.676 47.24h-7.912V31.65C76.764 14.172 62.592 0 45.114 0c-17.479 0-31.65 14.172-31.65 31.65v15.59H5.55C2.48 47.24 0 49.72 0 52.79v53.734a5.544 5.544 0 0 0 5.55 5.551h79.126c3.07 0 5.551-2.48 5.551-5.551V52.79c0-3.07-2.48-5.55-5.55-5.55ZM51.963 91.998c.473 1.771-.945 3.542-2.716 3.542H40.98c-1.89 0-3.189-1.771-2.716-3.542l2.598-10.039c-3.07-1.535-5.196-4.724-5.196-8.503a9.526 9.526 0 0 1 9.566-9.566 9.526 9.526 0 0 1 9.566 9.566c0 3.78-2.126 6.968-5.197 8.503L51.963 92Zm8.976-44.76h-31.65V31.65c0-8.739 7.085-15.825 15.825-15.825 8.739 0 15.825 7.086 15.825 15.825v15.59Z" />
  </svg>
)

SvgLock.propTypes = {
  title: PropTypes.string,
}
SvgLock.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgLock
