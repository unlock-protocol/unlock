import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgQr = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M16.364 10.91h-5.455v5.454h5.455v-5.455Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 4a4 4 0 0 1 4-4h23.273v27.273H0V4Zm5.455 1.455h16.363v16.363H5.455V5.455Z"
    />
    <path d="M10.91 43.636h5.454v5.455h-5.455v-5.455Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 32.727h27.273V60H4a4 4 0 0 1-4-4V32.727Zm5.455 5.455h16.363v16.363H5.455V38.182Z"
    />
    <path d="M43.636 10.91h5.455v5.454h-5.455v-5.455Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32.727 0v27.273H60V4a4 4 0 0 0-4-4H32.727Zm21.819 5.455H38.181v16.363h16.363V5.455Z"
    />
    <path d="M49.09 32.727H32.728v5.455h10.91v5.454h5.454V32.727ZM43.636 54.545V60H32.727v-5.455h10.91ZM49.09 54.545h-5.454v-5.454h5.455v5.454ZM49.09 54.545H60V56a4 4 0 0 1-4 4h-6.91v-5.455ZM54.545 32.727H60v5.455h-5.455v-5.455ZM54.545 43.636H60v5.455h-5.455v-5.455ZM38.182 43.636h-5.455v5.455h5.455v-5.455Z" />
  </svg>
)

SvgQr.propTypes = {
  title: PropTypes.string,
}
SvgQr.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgQr
