import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

const DisabledButton = ({
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

DisabledButton.propTypes = {
  children: PropTypes.node,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
  disabled: PropTypes.bool,
}
DisabledButton.defaultProps = {
  children: null,
  disabled: true,
  backgroundColor: 'white',
  backgroundHoverColor: 'white',
  fillColor: 'var(--lightgrey)',
  fillHoverColor: 'var(--lightgrey)',
}

export default DisabledButton
