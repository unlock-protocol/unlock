import * as React from 'react'
import { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgKey = ({
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
    <path d="M6.424 12.89a3.417 3.417 0 0 1 2.525-.995c.849.028 1.77-.067 2.37-.668l4.803-4.803a1.143 1.143 0 0 1 1.616 1.617l-4.803 4.803c-.6.6-.695 1.52-.667 2.37a3.416 3.416 0 0 1-3.42 3.528 3.428 3.428 0 0 1-2.424-5.853Zm3.233 3.232a1.145 1.145 0 0 0 0-1.616 1.145 1.145 0 0 0-1.616 0 1.145 1.145 0 0 0 0 1.616 1.145 1.145 0 0 0 1.616 0Z" />
    <path d="M12.89 9.657a1.143 1.143 0 0 1 1.616 0l1.616 1.616a1.143 1.143 0 1 1-1.616 1.616l-1.617-1.616a1.143 1.143 0 0 1 0-1.616ZM15.357 7.189a1.143 1.143 0 0 1 1.617 0l1.616 1.616a1.143 1.143 0 0 1-1.616 1.616l-1.617-1.616a1.143 1.143 0 0 1 0-1.616Z" />
  </svg>
)

export type { SVGRProps }
export default SvgKey
