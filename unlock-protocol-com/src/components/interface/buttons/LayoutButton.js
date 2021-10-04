import React from 'react'
import styled from 'styled-components'
import * as PropTypes from 'prop-types'
import Link from 'next/link'

const LayoutButton = ({ children, href, ...props }) => {
  if (href) {
    return (
      <Link href={href}>
        <BaseButton href={href} {...props}>
          {children}
        </BaseButton>
      </Link>
    )
  }
  return <BaseButton {...props}>{children}</BaseButton>
}

LayoutButton.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
}

LayoutButton.defaultProps = {
  children: null,
  href: '',
}

export const BaseButton = styled.a`
  background-color: ${(props) =>
    props.bold ? ' var(--link)' : 'var(--white)'};
  color: ${(props) => (props.bold ? 'white !important' : 'var(--link)')};
  border: none;
  font-size: 16px;
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  outline: none;
  margin-left: 16px;
  padding: 12px;
  transition: background-color 200ms ease;
  cursor: pointer;

  a {
    color: ${(props) =>
      props.bold ? 'var(--white)' : 'var(--link)'} !important;
  }

  &:hover {
    background-color: ${(props) =>
      props.bold ? 'var(--white)' : 'var(--link)'};
    color: ${(props) =>
      props.bold ? 'var(--link) !important' : 'var(--white)'};
  }
`

export default LayoutButton
