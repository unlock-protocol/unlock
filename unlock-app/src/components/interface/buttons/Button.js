import PropTypes from 'prop-types'
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

export const LayoutButton = ({href, title, children, ...props}) => (
  <Link href={href}>
    <Button
      href={href}
      backgroundColor="var(--grey)"
      fillColor="white"
      backgroundHoverColor="var(--link)"
      fillHoverColor="white"
      {...props}
    >
      {children}
      <Label>{title}</Label>
    </Button>
  </Link>
)

LayoutButton.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
}

LayoutButton.defaultProps = {
  href: '#',
  title: '',
  children: null,
}

export const LockButton = ({ href , children, ...props }) => (
  <Link href={href}>
    <Button
      href={href}
      backgroundColor="var(--lightgrey)"
      fillColor="var(--grey)"
      backgroundHoverColor="var(--link)"
      fillHoverColor="white"
      {...props}
    >
      {children}
    </Button>
  </Link>
)

LockButton.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
}

LockButton.defaultProps = {
  href: '#',
  children: null,
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
  font-family: 'IBM Plex Sans' ,'Helvetica Neue', Arial, sans-serif;
  font-weight: 400;
  font-size: 12px;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);

  ${Button}:hover & {
    display: grid;
  }

`
