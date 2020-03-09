import React from 'react'
import styled from 'styled-components'

interface Props {
  close: () => void
}

export const CheckoutContainer: React.FunctionComponent<Props> = ({
  close,
  children,
}: React.PropsWithChildren<Props>) => {
  return <Container onClick={close}>{children}</Container>
}

export const Container = styled.div`
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

export default CheckoutContainer
