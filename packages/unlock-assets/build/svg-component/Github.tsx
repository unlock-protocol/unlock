import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgGithub = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M9.021 21.829c.007 1.065.017 2.171.017 2.171h6.136c0-.419.016-1.795.016-3.502 0-1.191-.397-1.97-.84-2.364 2.756-.316 5.65-1.396 5.65-6.3 0-1.394-.479-2.533-1.272-3.426.127-.323.552-1.62-.123-3.378 0 0-1.038-.344-3.4 1.308a11.554 11.554 0 0 0-3.099-.43c-1.053.006-2.11.147-3.098.43C6.644 4.686 5.604 5.03 5.604 5.03c-.673 1.757-.248 3.055-.12 3.378-.793.893-1.275 2.032-1.275 3.426 0 4.892 2.89 5.987 5.638 6.31-.354.319-.674.881-.786 1.706-.706.327-2.498.89-3.602-1.06 0 0-.654-1.226-1.896-1.316 0 0-1.209-.016-.085.776 0 0 .812.393 1.374 1.867 0 0 .726 2.483 4.17 1.712Z" />
  </svg>
)

SvgGithub.propTypes = {
  title: PropTypes.string,
}
SvgGithub.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgGithub
