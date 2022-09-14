import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgUnlockMonogram = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M28 12.489v2.461H4V12.49h24ZM21.197 4h4.162v14.97c0 1.642-.387 3.085-1.163 4.33-.776 1.246-1.861 2.22-3.256 2.921-1.395.694-3.025 1.04-4.89 1.04-1.865 0-3.494-.346-4.89-1.04-1.394-.701-2.48-1.675-3.255-2.92-.768-1.246-1.153-2.69-1.153-4.33V4h4.151v14.624c0 .955.21 1.805.627 2.55a4.556 4.556 0 0 0 1.79 1.758c.776.417 1.686.626 2.73.626 1.052 0 1.962-.209 2.73-.627a4.46 4.46 0 0 0 1.79-1.756c.418-.746.627-1.596.627-2.551V4Z"
      fill="#000"
    />
  </svg>
)

SvgUnlockMonogram.propTypes = {
  title: PropTypes.string,
}
SvgUnlockMonogram.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgUnlockMonogram
