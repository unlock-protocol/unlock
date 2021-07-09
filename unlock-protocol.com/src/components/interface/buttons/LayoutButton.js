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

const BaseButton = styled.a`
  background-color: var(--white);
  color: var(--link);
  border: none;
  font-size: 16px;
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  outline: none;
  margin-left: 16px;
  padding: 12px;
  transition: background-color 200ms ease;
  cursor: pointer;

  &:hover {
    background-color: var(--link);
    color: var(--white);
  }
`

export default LayoutButton
