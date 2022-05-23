import * as React from 'react'
import PropTypes from 'prop-types'

const SvgIdea = ({ title, titleId, ...props }) => (
  <svg
    viewBox="-14 -4 130 130"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M7.806 48.14H2.602A2.61 2.61 0 0 0 0 50.742a2.61 2.61 0 0 0 2.602 2.602h5.204a2.61 2.61 0 0 0 2.603-2.602 2.61 2.61 0 0 0-2.603-2.602ZM98.882 48.14h-5.205a2.61 2.61 0 0 0-2.602 2.602 2.61 2.61 0 0 0 2.602 2.602h5.205a2.61 2.61 0 0 0 2.602-2.602 2.61 2.61 0 0 0-2.602-2.602ZM48.14 2.602v5.204a2.61 2.61 0 0 0 2.602 2.603 2.61 2.61 0 0 0 2.602-2.603V2.602A2.61 2.61 0 0 0 50.742 0a2.61 2.61 0 0 0-2.602 2.602ZM18.605 22.248c.52.52 1.171.781 1.822.781.65 0 1.3-.26 1.821-.78 1.041-1.041 1.041-2.603 0-3.644l-4.814-4.814c-1.04-1.04-2.602-1.04-3.643 0-1.04 1.041-1.04 2.602 0 3.643l4.814 4.814ZM82.878 79.236c-1.041-1.041-2.602-1.041-3.643 0-1.041 1.04-1.041 2.602 0 3.642l4.814 4.814c.52.52 1.17.781 1.821.781.65 0 1.301-.26 1.822-.78 1.04-1.041 1.04-2.603 0-3.644l-4.814-4.814ZM84.049 13.791l-4.814 4.814c-1.041 1.041-1.041 2.602 0 3.643.52.52 1.17.781 1.821.781.65 0 1.301-.26 1.822-.78l4.814-4.815c1.04-1.04 1.04-2.602 0-3.643-1.041-1.04-2.602-1.04-3.643 0ZM18.605 79.236l-4.814 4.813c-1.04 1.041-1.04 2.603 0 3.643.52.52 1.171.781 1.822.781.65 0 1.301-.26 1.821-.78l4.814-4.814c1.041-1.041 1.041-2.603 0-3.644-1.04-1.04-2.732-1.04-3.643 0ZM48.66 17.044C32.006 18.084 18.475 31.746 17.694 48.4c-.52 10.279 3.513 19.516 10.409 25.891 3.643 3.513 5.855 8.197 5.855 13.271v4.814h33.828v-4.814c0-4.944 1.951-9.628 5.594-13.01 6.636-6.116 10.67-14.703 10.67-24.46-.13-18.996-16.134-34.349-35.39-33.048ZM67.656 97.58H33.828v5.205h33.828v-5.204ZM67.656 106.688H33.828v5.204h33.828v-5.204ZM62.452 115.796h-23.42V121h23.42v-5.204Z" />
  </svg>
)

SvgIdea.propTypes = {
  title: PropTypes.string,
}
SvgIdea.defaultProps = {
  title: '',
}
export default SvgIdea
