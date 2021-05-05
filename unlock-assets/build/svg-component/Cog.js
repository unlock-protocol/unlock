import * as React from 'react'
import PropTypes from 'prop-types'

const SvgCog = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M17.918 13.167c.598 0 1.082-.485 1.082-1.082v-.168c0-.598-.485-1.084-1.084-1.084-.505 0-.932-.354-1.124-.822l-.017-.042c-.192-.456-.142-.997.207-1.347a1.06 1.06 0 000-1.5l-.158-.158a1.042 1.042 0 00-1.48.006c-.343.35-.878.4-1.328.206a4.106 4.106 0 00-.048-.02c-.455-.191-.801-.607-.801-1.1 0-.583-.473-1.056-1.056-1.056h-.221c-.584 0-1.057.473-1.057 1.056 0 .493-.345.91-.803 1.092l-.075.03c-.46.192-1.005.142-1.358-.209a1.07 1.07 0 00-1.508.002l-.152.15a1.06 1.06 0 00-.002 1.5c.349.35.398.89.205 1.345a5.246 5.246 0 00-.033.08c-.182.448-.59.787-1.073.787-.571 0-1.034.463-1.034 1.034v.266c0 .57.463 1.034 1.034 1.034.483 0 .891.339 1.073.787l.03.073c.193.455.143.996-.207 1.345a1.06 1.06 0 000 1.498l.145.146a1.078 1.078 0 001.518.005c.356-.35.902-.4 1.364-.208l.068.028c.46.184.808.603.808 1.098 0 .586.475 1.061 1.06 1.061h.213c.586 0 1.06-.475 1.06-1.061 0-.495.35-.914.806-1.105l.04-.017c.452-.195.99-.145 1.336.204a1.05 1.05 0 001.49.002l.15-.151a1.06 1.06 0 00-.002-1.499c-.35-.35-.4-.891-.209-1.347l.015-.035c.193-.468.62-.824 1.126-.824zm-5.962.578a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5z" />
  </svg>
)

SvgCog.propTypes = {
  title: PropTypes.string,
}
SvgCog.defaultProps = {
  title: '',
}
export default SvgCog
