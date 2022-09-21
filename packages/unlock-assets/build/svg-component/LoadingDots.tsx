import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgLoadingDots = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    id="loadingDots_svg__ep1opzeolwb1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <style>
      {
        '@keyframes ep1opzeolwb3_f_o{0%,to{fill-opacity:0}29.411765%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}52.941176%,76.470588%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}}@keyframes ep1opzeolwb4_f_o{0%,82.352941%,to{fill-opacity:0}11.764706%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}35.294118%,58.823529%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}}@keyframes ep1opzeolwb5_f_o{0%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}23.529412%,47.058824%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}70.588235%,to{fill-opacity:0}}'
      }
    </style>
    <path
      id="loadingDots_svg__ep1opzeolwb2"
      d="M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0 0 7.163 0 16s7.163 16 16 16Z"
      clipRule="evenodd"
      fill="#4D8BE8"
      fillRule="evenodd"
      stroke="none"
      strokeWidth={1}
    />
    <circle
      transform="translate(23.068 16)"
      fill="#FFF"
      fillOpacity={0}
      style={{
        animation: 'ep1opzeolwb3_f_o 1700ms linear infinite normal forwards',
      }}
      r={2.333}
    />
    <circle
      r={2.333}
      transform="translate(16 16)"
      fill="#FFF"
      fillOpacity={0}
      style={{
        animation: 'ep1opzeolwb4_f_o 1700ms linear infinite normal forwards',
      }}
    />
    <circle
      transform="translate(9 16)"
      fill="#FFF"
      fillOpacity={0}
      style={{
        animation: 'ep1opzeolwb5_f_o 1700ms linear infinite normal forwards',
      }}
      r={2.333}
    />
  </svg>
)

export type { SVGRProps }
export default SvgLoadingDots
