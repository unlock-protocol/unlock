import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgChevronUp = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.965.796a3 3 0 0 1 4.07 0l26 24a3 3 0 1 1-4.07 4.408L29 7.083 5.035 29.204a3 3 0 0 1-4.07-4.408l26-24Z"
    />
  </svg>
)

SvgChevronUp.propTypes = {
  title: PropTypes.string,
}
SvgChevronUp.defaultProps = {
  title: '',
}
export default SvgChevronUp
