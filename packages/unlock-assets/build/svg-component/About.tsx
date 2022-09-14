import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgAbout = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.522 11.121c.023-.165.032-.334.032-.5l.001-1.724v-.432H7.577a3914.548 3914.548 0 0 0 0 2.225c.001 1.083.656 1.985 1.702 2.35 1.43.5 3.044-.454 3.243-1.919Zm2.981-7.096v.178a860.597 860.597 0 0 1-.005 2.866h.825v1.446h-.825c0 .725.003 1.449.01 2.173.022 2.295-1.451 4.179-3.416 4.902-2.075.763-4.02.466-5.74-.929-1.195-.967-1.839-2.25-1.852-3.796-.007-.783-.009-1.566-.01-2.35h-.815V7.07h.816l.001-.894.002-2.055c0-.018.002-.036.004-.056l.003-.035h3.05v3.04h4.892V4.025h3.06Z"
    />
  </svg>
)

SvgAbout.propTypes = {
  title: PropTypes.string,
}
SvgAbout.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgAbout
