import styled from 'styled-components'
import { LockFooter } from './LockStyles'

const Footer = styled(LockFooter)<{ backgroundColor?: string; color?: string }>`
  background-color: ${props => props.backgroundColor || 'var(--link)'};
  color: ${props => props.color || 'var(--white)'};
  align-self: end;
`

/*
 * HoverFooter and NotHoverFooter are used exclusively by ConfirmedKeyLock.
 * They are here separately so that ConfirmedKey can import their CSS classes
 * to hide and show them based on its hover state.
 */
export const HoverFooter = styled(Footer)`
  display: none;
`

export const NotHoverFooter = styled(Footer)``
