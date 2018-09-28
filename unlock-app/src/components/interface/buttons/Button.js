import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

export const LayoutButton = ({href, title, children}) => (
  <Button href={href} backgroundColor={'var(--grey)'} hoverColor={'var(--link)'} >
    {children}
    <Label>{title}</Label>
  </Button>
)

LayoutButton.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
}

export const LockButton = ({ href, children }) => (
  <Button href={href} backgroundColor={'var(--lightgrey)'} hoverColor={'var(--link)'}>
    {children}
  </Button>
)

LockButton.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
}

export const Button = styled.a`
  background-color: ${props => props.backgroundColor};
  cursor: pointer;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  display: grid;

  &:hover {
    background-color: ${props => props.hoverColor};
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
