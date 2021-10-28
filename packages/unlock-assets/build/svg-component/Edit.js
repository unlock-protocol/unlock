import * as React from 'react'
import PropTypes from 'prop-types'

const SvgEdit = ({ title, titleId, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M7.853 13.843l-.498 3.828 3.706-1.435L9.5 15l-1.647-1.157z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.295 7.9c.178.562.131 1.192-.303 1.733l-5.541 6.916a.5.5 0 01-.21.153l-3.705 1.435a.5.5 0 01-.677-.53l.498-3.829a.5.5 0 01.106-.248l5.628-7.023c.434-.542 1.038-.724 1.625-.673.569.05 1.128.316 1.576.675.448.36.83.847 1.003 1.392zm-3.424-.768c.191-.239.446-.329.757-.302.33.03.707.193 1.039.46.332.266.575.599.674.913.095.298.062.566-.129.805l-5.23 6.527-1.172-.927a.52.52 0 00-.023-.017l-1.211-.851 5.295-6.608zm-5.629 7.595l.959.674.864.684-2.106.816.283-2.174z"
    />
  </svg>
)

SvgEdit.propTypes = {
  title: PropTypes.string,
}
SvgEdit.defaultProps = {
  title: '',
}
export default SvgEdit
