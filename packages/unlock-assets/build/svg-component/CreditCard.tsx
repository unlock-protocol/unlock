import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgCreditCard = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M.25 14.4c0 .424.18.831.502 1.131.322.3.758.469 1.212.469h20.572c.454 0 .89-.169 1.212-.469.321-.3.502-.707.502-1.131v-8h-24v8Zm3.429-3.2h6.857v1.6H3.679v-1.6ZM22.536 0H1.964C1.51 0 1.074.169.752.469.431.769.25 1.176.25 1.6v1.6h24V1.6c0-.424-.18-.831-.502-1.131A1.778 1.778 0 0 0 22.536 0Z" />
  </svg>
)

SvgCreditCard.propTypes = {
  title: PropTypes.string,
}
SvgCreditCard.defaultProps = {
  title: '',
}
export default SvgCreditCard
