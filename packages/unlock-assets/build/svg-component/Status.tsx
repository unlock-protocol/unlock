import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgStatus = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 768.4 759"
    style={{
      enableBackground: 'new 0 0 768.4 759',
    }}
    xmlSpace="preserve"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <circle
      cx={389.2}
      cy={379.4}
      r={278.8}
      style={{
        fill: '#fff',
        stroke: '#000',
        strokeMiterlimit: 10,
      }}
    />
    <path
      d="M444.7 375.9c-45.6 2.6-74.2-8-119.8-5.3-11.3.6-22.5 2.3-33.6 4.9 6.7-84.1 66.4-157.7 147.6-162.4 49.8-2.9 99.6 27.8 102.3 77.6 2.7 48.9-34.7 81.7-96.5 85.2zM322.2 548c-47.7 2.7-95.4-26-98-72.6-2.5-45.8 33.3-76.4 92.5-79.8 43.7-2.5 71.1 7.5 114.7 5 10.8-.6 21.6-2.1 32.2-4.6-6.4 78.7-63.6 147.6-141.4 152zM380.5 0C170.4 0 0 169.9 0 379.4s170.4 379.4 380.5 379.4S761 589 761 379.4 590.6 0 380.5 0"
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        fill: '#4360df',
      }}
    />
  </svg>
)

export type { SVGRProps }
export default SvgStatus
