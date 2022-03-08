import React from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'

interface Props {
  close: () => void
  children: React.ReactNode
}

export const CheckoutContainer: React.FunctionComponent<Props> = ({
  close,
  children,
}: React.PropsWithChildren<Props>) => {
  return <Container onClick={close}>{children}</Container>
}

export const Container = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
  overflow-x: hidden;
  ${Media.phone`
    padding-top: 0;
    padding-bottom: 0;
  `}

  &:before {
    content: '';
    background: rgba(0, 0, 0, 25%);
    position: absolute;
    inset: 0;
  }
`

export default CheckoutContainer
