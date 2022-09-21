import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgBlog = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      clipRule="evenodd"
      d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
      fill="none"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h5v2a.5.5 0 0 0 .8.4L15 18h3a1 1 0 0 0 1-1V7ZM8 10a1 1 0 0 0 1 1h6a1 1 0 1 0 0-2H9a1 1 0 0 0-1 1Zm1 5a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2H9Z"
    />
  </svg>
)

export type { SVGRProps }
export default SvgBlog
