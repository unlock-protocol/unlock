import React from 'react'
import styled from 'styled-components'

const ModalOverlay = () => <Greyout />

const Greyout = styled.div`
  background: var(--grey)
  opacity: 0.5;
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  & > p {
    background: var(--white);
  }
`

export default ModalOverlay
