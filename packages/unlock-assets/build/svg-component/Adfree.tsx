import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgAdfree = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m25.567 4.254 2.756-1.965L27.091.713.851 19.424 2.084 21l9.116-6.5.781 2.5h3.682L14 12.502l2.707-1.93V17h4.678c1.23-.006 2.344-.3 3.34-.879a6.03 6.03 0 0 0 2.324-2.422c.553-1.035.83-2.203.83-3.505v-.655c-.007-1.289-.293-2.451-.86-3.486a6.022 6.022 0 0 0-1.452-1.799Zm-2.442 1.741-2.99 2.133v6.235h1.191c.983 0 1.738-.348 2.266-1.044.527-.704.79-1.745.79-3.126v-.615c0-1.373-.263-2.409-.79-3.105a2.592 2.592 0 0 0-.466-.478Z"
    />
    <path d="M21.287 2.781c.136 0 .27.004.402.01l-4.982 3.553V2.78h4.58ZM10.408 2.781l2.356 6.375-2.639 1.882-1.328-4.272-1.524 4.931H9.2L2.044 16.8 7.186 2.78h3.222Z" />
  </svg>
)

export type { SVGRProps }
export default SvgAdfree
