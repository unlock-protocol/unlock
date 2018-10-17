import PropTypes from 'prop-types'
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

export const LayoutButton = ({href = '#', title, children}) => (
  <Link href={href}>
    <Button
      href={href}
      backgroundColor={'var(--grey)'}
      fillColor={'white'}
      backgroundHoverColor={'var(--link)'}
      fillHoverColor={'white'}
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
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

export const LockButton = ({ href, children }) => (
  <Link href={href}>
    <Button
      href={href}
      backgroundColor={'var(--lightgrey)'}
      fillColor={'var(--grey)'}
      backgroundHoverColor={'var(--link)'}
      fillHoverColor={'white'}
    >
      {children}
    </Button>
  </Link>
)

LockButton.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

export const Button = styled.a`
  background-color: ${props => props.backgroundColor || 'var(--grey)'};
  cursor: pointer;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  display: grid;

  > svg {
    fill: ${props => props.fillColor || 'white'};
    width: 100%;
    height: 100%;
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
