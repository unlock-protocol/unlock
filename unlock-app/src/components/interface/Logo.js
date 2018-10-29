import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Unlock from './svg/Unlock'

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

export default RoundedLogo

const Circle = styled.div`
  background-color: var(--pink);
  height: ${props => props.size || '56px'};
  width: ${props => props.size || '56px'};
  border-radius: 50%;

  > svg {
    fill: white;

}
`
