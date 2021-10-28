import * as React from 'react'
import PropTypes from 'prop-types'

const SvgMetamask = ({ title, titleId, ...props }) => (
  <svg
    viewBox="0 0 122 113"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M115.024 1L68.2 35.776 76.86 15.26 115.024 1z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.93 1l46.446 35.106-8.235-20.847L6.929 1zM98.176 81.612l-12.47 19.106 26.682 7.341 7.671-26.024-21.883-.423zM1.988 82.035l7.624 26.024 26.682-7.341-12.47-19.106-21.836.423z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M34.788 49.33l-7.435 11.247 26.494 1.176-.941-28.47-18.118 16.046zM87.165 49.33L68.811 32.953l-.612 28.8 26.447-1.176-7.483-11.247zM36.294 100.718L52.2 92.953l-13.742-10.73-2.164 18.495zM69.753 92.953l15.953 7.765-2.212-18.495-13.741 10.73z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M85.706 100.718l-15.953-7.765 1.27 10.4-.14 4.376 14.823-7.011zM36.294 100.718l14.824 7.011-.095-4.376 1.177-10.4-15.906 7.765z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M51.353 75.353l-13.27-3.906 9.364-4.282 3.906 8.188zM70.6 75.353l3.906-8.188 9.412 4.282L70.6 75.353z"
      fill="#233447"
      stroke="#233447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36.294 100.718l2.259-19.106-14.73.423 12.471 18.683zM83.447 81.612l2.259 19.106 12.47-18.683-14.729-.423zM94.647 60.576L68.2 61.753l2.447 13.6 3.906-8.188 9.412 4.282 10.682-10.87zM38.082 71.447l9.412-4.282 3.859 8.188 2.494-13.6-26.494-1.177 10.73 10.871z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.353 60.576l11.106 21.648-.377-10.777-10.73-10.87zM83.965 71.447l-.471 10.776 11.153-21.647-10.682 10.871zM53.847 61.753l-2.494 13.6L54.459 91.4l.705-21.13-1.317-8.517zM68.2 61.753l-1.27 8.47.564 21.177 3.153-16.047-2.447-13.6z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M70.647 75.353L67.494 91.4l2.259 1.553 13.741-10.73.47-10.776-13.317 3.906zM38.082 71.447l.377 10.776L52.2 92.954l2.259-1.553-3.106-16.047-13.27-3.906z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M70.882 107.729l.141-4.376-1.176-1.035H52.106l-1.083 1.035.095 4.376-14.824-7.011 5.177 4.235 10.494 7.294h18.023l10.541-7.294 5.177-4.235-14.824 7.011z"
      fill="#C0AD9E"
      stroke="#C0AD9E"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M69.753 92.953L67.494 91.4H54.46L52.2 92.953l-1.176 10.4 1.082-1.035h17.741l1.177 1.035-1.271-10.4z"
      fill="#161616"
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M117 38.035l4-19.2L115.024 1 69.753 34.6l17.412 14.73 24.611 7.2 5.459-6.354-2.353-1.694 3.765-3.435-2.918-2.259 3.765-2.87L117 38.035zM1 18.835l4 19.2-2.541 1.883 3.765 2.87-2.871 2.26 3.765 3.434-2.353 1.694 5.412 6.353 24.611-7.2L52.2 34.6 6.93 1 1 18.835z"
      fill="#763D16"
      stroke="#763D16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M111.777 56.53l-24.612-7.2 7.482 11.246-11.153 21.648 14.683-.189h21.882l-8.282-25.506zM34.788 49.33l-24.612 7.2-8.188 25.505h21.835l14.636.189-11.106-21.648 7.435-11.247zM68.2 61.753L69.753 34.6l7.153-19.341H45.14l7.06 19.341 1.646 27.153.565 8.565.047 21.082h13.035l.094-21.082.612-8.565z"
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
export default SvgMetamask
