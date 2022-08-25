import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgWallet = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M14 3.8H1.5v-.51l11-.894v.895H14V1.766C14 .647 13.109-.137 12.021.02L1.98 1.478C.891 1.637 0 2.681 0 3.8v10.168C0 15.088.895 16 2 16h12c1.104 0 2-.911 2-2.034V5.834c0-1.123-.896-2.034-2-2.034Zm-1.5 7.122c-.828 0-1.5-.683-1.5-1.525 0-.841.672-1.525 1.5-1.525s1.5.684 1.5 1.525c0 .842-.672 1.525-1.5 1.525Z" />
  </svg>
)

SvgWallet.propTypes = {
  title: PropTypes.string,
}
SvgWallet.defaultProps = {
  title: '',
}
export default SvgWallet
