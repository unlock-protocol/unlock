import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgJobs = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 5h-2a2 2 0 0 0-2 2H7a2 2 0 0 0-2 2v1h14V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2-2Zm1 2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1h4Zm-9 4h14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4Z"
    />
  </svg>
)

export type { SVGRProps }
export default SvgJobs
