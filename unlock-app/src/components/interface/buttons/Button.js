import PropTypes from 'prop-types'
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const clickAction = (e, action) => {
  e.stopPropagation()
  if (action) action()
}

const BaseButton = ({
  href,
  label,
  children,
  action,
  disabled,
  title,
  ...props
}) => {
  const button = (
    <ButtonLink
      href={href}
      onClick={e => {
        if (!disabled) return clickAction(e, action)
      }}
      title={label ? label : title}
      {...props}
    >
      {children}
      {label && <Label>{label}</Label>}
    </ButtonLink>
  )
  if (href) {
    return <Link href={href}>{button}</Link>
  }
  return button
}

BaseButton.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
  action: PropTypes.func,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
}

BaseButton.defaultProps = {
  href: null,
  label: '',
  children: null,
  action: null,
  backgroundColor: 'var(--lightgrey)',
  backgroundHoverColor: 'var(--link)',
  fillColor: 'var(--grey)',
  fillHoverColor: 'white',
}

export const ButtonLink = styled.a`
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
  top: 12px;
  left: 50%;
  transform: translateX(-50%);

  ${ButtonLink}:hover & {
    display: grid;
  }
`

export default BaseButton
