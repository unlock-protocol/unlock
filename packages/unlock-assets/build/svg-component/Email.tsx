import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgEmail = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.044 7.705A1 1 0 0 0 5 8v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a.998.998 0 0 0-.044-.295.497.497 0 0 1-.171.206l-5.931 4.106a1.5 1.5 0 0 1-1.708 0l-5.93-4.106a.498.498 0 0 1-.172-.206Zm13.25-.66A1 1 0 0 0 18 7H6a1 1 0 0 0-.295.044.503.503 0 0 1 .08.045l5.93 4.106a.5.5 0 0 0 .57 0l5.93-4.106a.502.502 0 0 1 .08-.045Z"
    />
  </svg>
)

export type { SVGRProps }
export default SvgEmail
