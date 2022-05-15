import React from 'react'
import styled from 'styled-components'
import Close from '../buttons/layout/Close'
import Media from '../../../theme/media'
import { CheckoutFooter } from './CheckoutStyles'

interface WrapperProps {
  hideCheckout: (...args: any[]) => any
  allowClose: boolean
  back: () => void | null
  showBack: boolean
  onLoggedOut: () => void
  children: React.ReactNode
}

interface WrapperStyleProps {
  bgColor: string
}

const CheckoutWrapper: React.FunctionComponent<WrapperProps> = ({
  children,
  back,
  hideCheckout,
  allowClose = true,
  onLoggedOut,
  showBack,
}: React.PropsWithChildren<WrapperProps>) => {
  return (
    <Wrapper
      bgColor="var(--offwhite)"
      onClick={(e) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
      }}
    >
      {allowClose ? (
        <CloseButton
          backgroundColor="var(--lightgrey)"
          fillColor="var(--grey)"
          onClick={hideCheckout}
        />
      ) : (
        ''
      )}
      {children}
      <CheckoutFooter
        showBack={showBack}
        back={back}
        onLoggedOut={onLoggedOut}
      />
    </Wrapper>
  )
}

export default CheckoutWrapper

const CloseButton = styled(Close).attrs(() => ({
  className: 'closeButton',
}))`
  position: absolute;
  top: 12px;
  right: 12px;
`

const Wrapper = styled.section`
  padding: 24px 40px 10px;
  display: flex;
  flex-direction: column;
  background-color: ${(props: WrapperStyleProps) => props.bgColor};
  color: var(--darkgrey);
  border-radius: 4px;
  position: relative;
  ${Media.nophone`
    width: 380px;
  `}
  ${Media.phone`
    width: 100%;
    height: 100vh;
  `}
`
