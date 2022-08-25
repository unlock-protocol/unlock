import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgTwitter = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 7.42a5.49 5.49 0 0 1-1.65.477 3.012 3.012 0 0 0 1.264-1.675 5.566 5.566 0 0 1-1.825.734A2.798 2.798 0 0 0 14.692 6c-1.585 0-2.87 1.356-2.87 3.03 0 .237.024.467.073.69-2.387-.127-4.503-1.332-5.92-3.167-.248.449-.39.97-.39 1.525 0 1.05.508 1.978 1.279 2.52a2.76 2.76 0 0 1-1.302-.377v.037c0 1.469.99 2.693 2.305 2.97a2.718 2.718 0 0 1-1.298.053c.366 1.204 1.426 2.08 2.684 2.103A5.575 5.575 0 0 1 5 16.64 7.839 7.839 0 0 0 9.403 18c5.284 0 8.172-4.615 8.172-8.619 0-.132-.002-.263-.007-.392A5.998 5.998 0 0 0 19 7.42"
    />
  </svg>
)

SvgTwitter.propTypes = {
  title: PropTypes.string,
}
SvgTwitter.defaultProps = {
  title: '',
}
export default SvgTwitter
