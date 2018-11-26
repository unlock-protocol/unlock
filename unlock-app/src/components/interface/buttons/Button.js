import PropTypes from 'prop-types'
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const clickAction = (e, action) => {
  e.stopPropagation()
  if (action) action()
}

export const LayoutButton = ({ href, title, children, action, ...props }) => {
  const button = (
    <Button href={href} onClick={e => clickAction(e, action)} {...props}>
      {children}
      <Label>{title}</Label>
    </Button>
  )
  if (href) {
    return <Link href={href}>{button}</Link>
  }
  return button
}

LayoutButton.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  action: PropTypes.func,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

LayoutButton.defaultProps = {
  href: null,
  title: '',
  children: null,
  action: null,
  backgroundColor: 'var(--grey)',
  backgroundHoverColor: 'var(--link)',
  fillColor: 'white',
  fillHoverColor: 'white',
}

export const LockButton = ({ href, children, action, ...props }) => {
  const button = (
    <Button
      href={href}
      backgroundColor="var(--lightgrey)"
      fillColor="var(--grey)"
      backgroundHoverColor="var(--link)"
      fillHoverColor="white"
      onClick={e => clickAction(e, action)}
      {...props}
    >
      {children}
    </Button>
  )
  if (href) {
    return <Link href={href}>{button}</Link>
  }
  return button
}

LockButton.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
  action: PropTypes.func,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

LockButton.defaultProps = {
  href: null,
  children: null,
  action: null,
  backgroundColor: 'var(--lightgrey)',
  backgroundHoverColor: 'var(--link)',
  fillColor: 'var(--grey)',
  fillHoverColor: 'white',
}

export const Button = styled.a`
  background-color: ${props => props.backgroundColor || 'var(--grey)'};
  cursor: pointer;
  border-radius: 50%;
  height: ${props => props.size || ' 24px'};
  width: ${props => props.size || ' 24px'};
  display: grid;
  padding: 0;
  border: 0;

  > svg {
    fill: ${props => props.fillColor || 'white'};
    height: ${props => props.size || ' 24px'};
    width: ${props => props.size || ' 24px'};
  }

  &:hover {
    background-color: ${props => props.backgroundHoverColor || 'var(--link)'};

    > svg {
      fill: ${props => props.fillHoverColor || 'white'};
    }
  }
`

export const Label = styled.small`
  display: none;
  position: relative;
  z-index: 1000;
  white-space: nowrap;
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400;
  font-size: 12px;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);

  ${Button}:hover & {
    display: grid;
  }
`
