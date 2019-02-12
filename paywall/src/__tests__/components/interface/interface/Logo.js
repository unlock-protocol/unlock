import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Unlock from './svg/Unlock'
import UnlockWordMark from './svg/UnlockWordMark'

/**
 * This wraps the Unlock SVG component into a pink circle.
 * Note: we need to keep the viewBox to ensure that the SVG will resize.
 * @param {string} size
 */
export const RoundedLogo = ({ size }) => (
  <Circle size={size}>
    <Unlock viewBox="0 0 56 56" />
  </Circle>
)

RoundedLogo.propTypes = {
  size: PropTypes.string,
}

RoundedLogo.defaultProps = {
  size: '56px',
}

const Circle = styled.div`
  background-color: var(--brand);
  height: ${props => props.size || '56px'};
  width: ${props => props.size || '56px'};
  border-radius: 50%;

  > svg {
    fill: white;
  }
`

export const WordMarkLogo = styled(UnlockWordMark)`
  fill: var(--brand);
`
