import PropTypes from 'prop-types'
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const clickAction = (e, action) => {
  e.stopPropagation()
  if (action) action()
}

const Button = ({
  href,
  label,
  children,
  action,
  disabled,
  title,
  target,
  ...props
}) => {
  const button = (
    <ButtonLink
      href={href}
      target={target}
      onClick={(e) => {
        if (!disabled) return clickAction(e, action)
      }}
      title={label || title}
      {...props}
    >
      {children}
      {label && <Label>{label}</Label>}
    </ButtonLink>
  )

  // Use Next nav for non external links
  if (href && target !== '_blank' && !href.startsWith('http')) {
    return <Link href={href}>{button}</Link>
  }

  return button
}

Button.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
  action: PropTypes.func,
  backgroundColor: PropTypes.string,
  backgroundHoverColor: PropTypes.string,
  fillColor: PropTypes.string,
  fillHoverColor: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  target: PropTypes.string,
}

Button.defaultProps = {
  href: null,
  label: '',
  target: '_self',
  children: null,
  action: null,
  backgroundColor: 'var(--lightgrey)',
  backgroundHoverColor: 'var(--link)',
  fillColor: 'var(--grey)',
  fillHoverColor: 'white',
  disabled: false,
  title: '',
}

export const ButtonLink = styled.a`
  background-color: ${(props) => props.backgroundColor || 'var(--grey)'};
  cursor: pointer;
  border-radius: ${(props) => props.borderRadius || '50%'};
  height: ${(props) => props.size || '24px'};
  width: ${(props) => props.size || '24px'};
  display: inline-block;
  padding: 0;
  border: 0;
  line-height: '15px';

  > svg {
    fill: ${(props) => props.fillColor || 'white'};
    height: ${(props) => props.size || '24px'};
    width: ${(props) => props.size || '24px'};
  }

  &:hover {
    background-color: ${(props) => props.backgroundHoverColor || 'var(--link)'};

    > svg {
      fill: ${(props) => props.fillHoverColor || 'white'};
    }
  }
  &:focus {
    outline: none;
  }
`

export const Label = styled.small`
  display: none;
  position: relative;
  z-index: var(--alwaysontop);
  white-space: nowrap;
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--link);

  ${ButtonLink}:hover & {
    display: inline-block;
  }
`

export default Button
