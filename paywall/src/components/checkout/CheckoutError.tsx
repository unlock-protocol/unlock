import styled from 'styled-components'
import React from 'react'

import Close from '../interface/buttons/layout/Close'
import Info from '../interface/svg/Info'
import Media from '../../theme/media'

interface CheckoutErrorModalProps {
  message: string
  dismiss: () => void
}

export default function CheckoutErrorModal({
  message,
  dismiss,
}: CheckoutErrorModalProps) {
  return (
    <Centered>
      <Error>
        <CloseButton onClick={dismiss} />
        <Header>
          <Title>
            <ErrorIcon title="error" />
            <UnlockedText>Error</UnlockedText>
          </Title>
          <p>{message}</p>
          <p>
            Please refresh the page, and if the error occurs again, let us know!
          </p>
        </Header>
      </Error>
    </Centered>
  )
}

const UnlockedText = styled.span`
  padding-left: 10px;
  ${Media.phone`
    padding-left: 0;
  `}
`

const Header = styled.header`
  display: grid;

  p {
    font-size: 20px;
  }
`

const ErrorIcon = styled(Info)`
  height: 30px;
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 200;
  vertical-align: middle;
`

const CloseButton = styled(Close).attrs(() => ({
  className: 'closeButton',
}))`
  position: absolute;
  top: 24px;
  right: 24px;
`
const Centered = styled.dialog`
  width: 98%;
  height: 96%;
  display: flex;
  place-content: center;
  background-color: rgba(0, 0, 0, 0.5);

  ${Media.phone`
    width: 100%;
    height: 100%;
  `}
`

const Error = styled.article`
  background-color: var(--white);
  border-radius: 4px;
  width: 80%;
  padding: 10px 40px;
  display: flex;
  flex-direction: column;
  position: relative;

  ${Media.phone`
    width: 95%;
  `}
`
