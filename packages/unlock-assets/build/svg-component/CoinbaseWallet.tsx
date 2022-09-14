import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgCoinbaseWallet = ({
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
      d="M16 4.8C9.81 4.8 4.8 9.81 4.8 16c0 6.19 5.01 11.2 11.2 11.2 6.19 0 11.2-5.01 11.2-11.2 0-6.19-5.01-11.2-11.2-11.2Zm0 17.753A6.556 6.556 0 0 1 9.447 16 6.556 6.556 0 0 1 16 9.446 6.556 6.556 0 0 1 22.554 16 6.556 6.556 0 0 1 16 22.553Z"
      fill="url(#coinbase-wallet_svg__a)"
    />
    <path
      d="M17.59 18.104H14.41a.504.504 0 0 1-.5-.5v-3.193c0-.273.228-.5.5-.5h3.194c.272 0 .5.227.5.5v3.193c0 .273-.228.5-.515.5Z"
      fill="#2059EB"
    />
    <defs>
      <linearGradient
        id="coinbase-wallet_svg__a"
        x1={16}
        y1={27.2}
        x2={16}
        y2={4.8}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1447EA" />
        <stop offset={1} stopColor="#2B65FB" />
      </linearGradient>
    </defs>
  </svg>
)

SvgCoinbaseWallet.propTypes = {
  title: PropTypes.string,
}
SvgCoinbaseWallet.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgCoinbaseWallet
