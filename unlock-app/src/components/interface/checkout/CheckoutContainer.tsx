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
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  padding-top: 10%;
  padding-bottom: 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  overflow-x: hidden;
  ${Media.phone`
    padding-top: 0;
    padding-bottom: 0;
  `}
`

export default CheckoutContainer
