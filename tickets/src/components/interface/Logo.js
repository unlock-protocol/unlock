import styled from 'styled-components'
import React from 'react'
import Unlock from './svg/Unlock'
import UnlockWordMark from './svg/UnlockWordMark'
import Media from '../../theme/media'

/**
 * This wraps the Unlock SVG component into a pink circle.
 * Note: we need to keep the viewBox to ensure that the SVG will resize.
 * @param {string} size
 */
export const RoundedLogo = () => (
  <Circle>
    <Unlock viewBox="0 0 56 56" />
  </Circle>
)

const Circle = styled.div`
  background-color: var(--brand);
  height: 28px;
  width: 28px;
  border-radius: 50%;

  > svg {
    fill: white;
  }

  ${Media.phone`
    height: 16px;
    width: 16px;
  `}
`

export const WordMarkLogo = styled(UnlockWordMark)`
  fill: var(--brand);
`
