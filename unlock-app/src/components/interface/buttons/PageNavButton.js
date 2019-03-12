import React from 'react'
import * as PropTypes from 'prop-types'

import LayoutButton from './LayoutButton'

const PageNavButton = ({
  children,
  activePath,
  highlightBackground,
  highlightForeground,
  dimBackground,
  dimForeground,
  href,
  ...props
}) => {
  const isActivePage = href === activePath
  return (
    <LayoutButton
      href={href}
      backgroundColor={isActivePage ? highlightBackground : dimBackground}
      fillColor={isActivePage ? highlightForeground : dimForeground}
      {...props}
    >
      {children}
    </LayoutButton>
  )
}

PageNavButton.propTypes = {
  children: PropTypes.node,
  activePath: PropTypes.string.isRequired,
  highlightBackground: PropTypes.string,
  highlightForeground: PropTypes.string,
  dimBackground: PropTypes.string,
  dimForeground: PropTypes.string,
  href: PropTypes.string.isRequired,
}

PageNavButton.defaultProps = {
  children: null,
  highlightBackground: 'var(--link)',
  highlightForeground: 'var(--white)',
  dimBackground: 'var(--lightgrey)',
  dimForeground: 'var(--grey)',
}

export default PageNavButton
