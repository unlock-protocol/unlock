import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgCarret = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M0 0h12L6 8 0 0Z" />
  </svg>
)

SvgCarret.propTypes = {
  title: PropTypes.string,
}
SvgCarret.defaultProps = {
  title: '',
}
export default SvgCarret
