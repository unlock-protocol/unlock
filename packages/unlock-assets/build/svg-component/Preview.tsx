import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgPreview = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M13.91 12c0 1.036-.856 1.875-1.91 1.875-1.054 0-1.91-.84-1.91-1.875 0-1.036.856-1.875 1.91-1.875 1.054 0 1.91.84 1.91 1.875Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.445 11.773 19 12l.445.227v.002l-.003.004-.006.013a3.808 3.808 0 0 1-.12.217 12.818 12.818 0 0 1-1.784 2.382C16.296 16.141 14.424 17.5 12 17.5s-4.296-1.36-5.532-2.655a12.827 12.827 0 0 1-1.784-2.382 7.57 7.57 0 0 1-.12-.217l-.006-.013-.002-.004-.001-.001L5 12l-.445-.227v-.002l.003-.004.006-.013a4.07 4.07 0 0 1 .12-.217 12.827 12.827 0 0 1 1.784-2.382C7.704 7.859 9.576 6.5 12 6.5s4.296 1.36 5.532 2.655a12.818 12.818 0 0 1 1.784 2.382 7.78 7.78 0 0 1 .12.217l.006.013.003.004v.002Zm-13.56.734c-.135-.206-.24-.38-.314-.507a11.825 11.825 0 0 1 1.62-2.155C8.341 8.641 9.97 7.5 12 7.5s3.659 1.14 4.809 2.345A11.826 11.826 0 0 1 18.429 12a11.829 11.829 0 0 1-1.62 2.155C15.659 15.36 14.03 16.5 12 16.5s-3.659-1.14-4.809-2.345a11.827 11.827 0 0 1-1.306-1.648Z"
    />
    <path d="m19 12 .445-.227a.501.501 0 0 1 0 .454L19 12ZM4.555 11.773 5 12l-.445.228a.503.503 0 0 1 0-.455Z" />
  </svg>
)

SvgPreview.propTypes = {
  title: PropTypes.string,
}
SvgPreview.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgPreview
