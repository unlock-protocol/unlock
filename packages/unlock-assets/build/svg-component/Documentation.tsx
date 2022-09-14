import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgDocumentation = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.385 2.959c0-.788.614-1.498 1.482-1.498H51.198c.843 0 1.494.687 1.494 1.5v5.885h3.423a1.5 1.5 0 0 1 1.5 1.5v38.27a1 1 0 0 1-.282.696L44.779 62.235a1 1 0 0 1-.718.303H15.27c-.821 0-1.5-.661-1.5-1.497v-5.887H7.885c-.822 0-1.5-.662-1.5-1.498V2.96Zm44.307.502v5.385H15.27c-.821 0-1.5.662-1.5 1.497v42.81H8.385V3.462H50.692ZM15.77 10.846v49.692h27.292V48.615a1 1 0 0 1 1-1h11.554V10.846H15.77Zm38.48 38.77h-9.188v9.458l9.189-9.459ZM19.693 18.691a1 1 0 1 0 0 2h32a1 1 0 1 0 0-2h-32Zm-1 8.385a1 1 0 0 1 1-1h32a1 1 0 1 1 0 2h-32a1 1 0 0 1-1-1Zm1 6.384a1 1 0 1 0 0 2h32a1 1 0 1 0 0-2h-32Zm-1 8.385a1 1 0 0 1 1-1h32a1 1 0 0 1 0 2h-32a1 1 0 0 1-1-1Zm1 6.385a1 1 0 1 0 0 2h17.231a1 1 0 0 0 0-2h-17.23Z"
    />
  </svg>
)

SvgDocumentation.propTypes = {
  title: PropTypes.string,
}
SvgDocumentation.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgDocumentation
