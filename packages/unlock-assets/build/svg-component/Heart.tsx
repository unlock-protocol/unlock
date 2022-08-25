import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgHeart = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M22.15 2.945a6.303 6.303 0 0 0-2.05-1.44A6.05 6.05 0 0 0 17.683 1a6.05 6.05 0 0 0-2.417.505 6.304 6.304 0 0 0-2.05 1.44l-.854.898a.5.5 0 0 1-.725 0l-.854-.898C9.598 1.7 7.992 1.001 6.316 1.001 4.641 1 3.035 1.7 1.85 2.945S0 5.878 0 7.639c0 1.76.665 3.449 1.85 4.694l1.217 1.279 8.57 9.007a.5.5 0 0 0 .725 0l8.57-9.007 1.217-1.28a6.667 6.667 0 0 0 1.37-2.153A6.93 6.93 0 0 0 24 7.64a6.93 6.93 0 0 0-.481-2.54 6.668 6.668 0 0 0-1.37-2.154Z" />
  </svg>
)

SvgHeart.propTypes = {
  title: PropTypes.string,
}
SvgHeart.defaultProps = {
  title: '',
}
export default SvgHeart
