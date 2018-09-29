import styled from 'styled-components'
import Unlock from './svg/Unlock'

import React from 'react'

export const RoundedLogo = () => (
  <Circle>
    <Unlock />
  </Circle>
)

export default RoundedLogo

const Circle = styled.div`
  background-color: var(--pink);
  height: 56px;
  width: 56px;
  border-radius: 50px;

  > svg {
    fill: white;
  }
`
