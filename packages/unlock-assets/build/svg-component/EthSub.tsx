import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgEthSub = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path fillRule="evenodd" d="M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z" />
  </svg>
)

export type { SVGRProps }
export default SvgEthSub
