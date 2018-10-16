import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

export const LayoutButton = ({ to = '#', title, children }) => (
  <Button
    to={to}
    backgroundcolor={'var(--grey)'}
    fillcolor={'white'}
    backgroundhovercolor={'var(--link)'}
    fillhovercolor={'white'}
  >
    {children}
    <Label>{title}</Label>
  </Button>
)

LayoutButton.propTypes = {
  to: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  backgroundcolor: PropTypes.string,
  backgroundhovercolor: PropTypes.string,
  fillcolor: PropTypes.string,
  fillhovercolor: PropTypes.string,
}

export const LockButton = ({ to = '#', children }) => (
  <Button
    to={to}
    backgroundcolor={'var(--lightgrey)'}
    fillcolor={'var(--grey)'}
    backgroundhovercolor={'var(--link)'}
    fillhovercolor={'white'}
  >
    {children}
  </Button>
)

LockButton.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node,
  backgroundcolor: PropTypes.string,
  backgroundhovercolor: PropTypes.string,
  fillcolor: PropTypes.string,
  fillhovercolor: PropTypes.string,
}

export const Button = styled(Link)`
  background-color: ${props => props.backgroundcolor || 'var(--grey)'};
  cursor: pointer;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  display: grid;

  > svg {
    fill: ${props => props.fillcolor || 'white'};
    width: 100%;
    height: 100%;
  }

  &:hover {
    background-color: ${props => props.backgroundhovercolor || 'var(--link)'};

    > svg {
      fill: ${props => props.fillhovercolor || 'white'};
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
