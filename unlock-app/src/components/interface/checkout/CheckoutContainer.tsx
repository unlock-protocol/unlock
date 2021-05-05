import React from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'

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
  top: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${Media.phone`
    top: 0;
  `}
`

export default CheckoutContainer
