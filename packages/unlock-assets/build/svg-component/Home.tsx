import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgHome = ({
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
    <path d="M12.5 5.5c-.195-.192-.805-.192-1 0l-6.351 6.567a.5.5 0 0 0 .351.856h1.214V17.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5v-2.885h3.428V17.5a.5.5 0 0 0 .5.5h2.572a.5.5 0 0 0 .5-.5v-4.577H18.5a.5.5 0 0 0 .351-.856L12.5 5.5Z" />
  </svg>
)

export type { SVGRProps }
export default SvgHome
