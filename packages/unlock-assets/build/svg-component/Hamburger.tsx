import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgHamburger = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3Zm0 18a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3Zm0 18a3 3 0 0 1 3-3h56a3 3 0 1 1 0 6H3a3 3 0 0 1-3-3Z"
    />
  </svg>
)

SvgHamburger.propTypes = {
  title: PropTypes.string,
}
SvgHamburger.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgHamburger
