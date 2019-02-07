import React from 'react'
import styled from 'styled-components'

const ModalOverlay = ({ children }) => (
  <Greyout>
    <MessageBox>
      {children}
      <Dismiss>Dismiss</Dismiss>
    </MessageBox>
  </Greyout>
)

export const WalletCheckOverlay = () => (
  <ModalOverlay>
    <p>Please check your browser wallet to complete the transaction.</p>
  </ModalOverlay>
)

const Dismiss = styled.button`
  height: 24px;
  font-size: 20px;
  font-family: Roboto;
  text-align: center;
  border: none;
  background: none;
  color: var(--grey);

  &:hover {
    color: var(--link);
  }
`

const MessageBox = styled.div`
  background: var(--white);
  min-width: 50%;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--darkgrey);
  font-size: 20px;
`

const Greyout = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default ModalOverlay
