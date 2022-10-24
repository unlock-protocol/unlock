import React from 'react'
import * as PropTypes from 'prop-types'

import Button from './Button'

const LayoutButton = ({
  children,
  backgroundColor,
  backgroundHoverColor,
  fillColor,
  fillHoverColor,
  ...props
}) => {
  return (
    <Button
      backgroundColor={backgroundColor}
      backgroundHoverColor={backgroundHoverColor}
      fillColor={fillColor}
      fillHoverColor={fillHoverColor}
      {...props}
    >
      {children}
    </Button>
  )
}

LayoutButton.propTypes = {
  children: PropTypes.node,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

LayoutButton.defaultProps = {
  children: null,
  backgroundColor: 'var(--grey)',
  backgroundHoverColor: 'var(--link)',
  fillColor: 'white',
  fillHoverColor: 'white',
}

export default LayoutButton
