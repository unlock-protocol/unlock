import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgMetamask = ({
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
      d="m25.223 6.053-7.995 5.938 1.478-3.503 6.517-2.435Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m6.768 6.053 7.93 5.994-1.406-3.56-6.524-2.434ZM22.348 19.816l-2.13 3.262 4.556 1.253 1.31-4.443-3.736-.072ZM5.924 19.888l1.302 4.443 4.556-1.253-2.13-3.262-3.728.072Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m11.525 14.306-1.27 1.92 4.524.2-.16-4.86-3.094 2.74ZM20.468 14.306l-3.134-2.797-.104 4.918 4.515-.201-1.277-1.92ZM11.782 23.08l2.716-1.326-2.346-1.832-.37 3.158ZM17.494 21.754l2.724 1.326-.377-3.158-2.347 1.832Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m20.22 23.079-2.725-1.326.217 1.776-.024.747 2.531-1.197ZM11.782 23.079l2.531 1.197-.016-.747.2-1.776-2.715 1.326Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m14.353 18.748-2.266-.667 1.6-.731.666 1.398ZM17.638 18.748l.667-1.398 1.607.731-2.274.667Z"
      fill="#233447"
      stroke="#233447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m11.782 23.078.385-3.262-2.515.072 2.13 3.19ZM19.834 19.816l.385 3.262 2.13-3.19-2.515-.072ZM21.745 16.225l-4.516.2.418 2.323.667-1.398 1.607.731 1.824-1.856ZM12.087 18.081l1.607-.731.659 1.398.425-2.322-4.523-.201 1.832 1.856Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m10.255 16.225 1.896 3.696-.064-1.84-1.832-1.856ZM19.92 18.081l-.08 1.84 1.904-3.696-1.824 1.856ZM14.778 16.425l-.426 2.322.53 2.74.121-3.608-.225-1.454ZM17.229 16.425l-.217 1.446.096 3.616.538-2.74-.417-2.322Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m17.648 18.748-.539 2.74.386.265 2.346-1.832.08-1.84-2.273.667ZM12.087 18.081l.065 1.84 2.346 1.832.386-.265-.53-2.74-2.267-.667Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m17.688 24.278.024-.747-.2-.177h-3.03l-.185.177.016.747-2.531-1.197.884.723 1.792 1.246h3.077l1.8-1.246.884-.723-2.531 1.197Z"
      fill="#C0AD9E"
      stroke="#C0AD9E"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m17.495 21.756-.386-.265h-2.226l-.385.265-.201 1.776.185-.177h3.029l.2.177-.216-1.776Z"
      fill="#161616"
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m25.56 12.377.684-3.279-1.02-3.045-7.73 5.737 2.973 2.515 4.202 1.23.932-1.085-.402-.29.643-.586-.498-.386.643-.49-.426-.321ZM5.755 9.098l.683 3.279-.434.321.643.49-.49.386.642.587-.402.289.924 1.085 4.203-1.23 2.973-2.515-7.73-5.737-1.012 3.045Z"
      fill="#763D16"
      stroke="#763D16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m24.67 15.533-4.203-1.23 1.278 1.92-1.904 3.697 2.506-.033h3.737l-1.414-4.354ZM11.525 14.303l-4.203 1.23-1.398 4.354h3.728l2.5.033-1.897-3.697 1.27-1.92ZM17.23 16.426l.265-4.636 1.22-3.303h-5.423l1.206 3.303.28 4.636.097 1.463.008 3.6h2.226l.016-3.6.104-1.463Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

SvgMetamask.propTypes = {
  title: PropTypes.string,
}
SvgMetamask.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgMetamask
