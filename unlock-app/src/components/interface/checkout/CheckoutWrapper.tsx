import React from 'react'
import styled from 'styled-components'
import Close from '../buttons/layout/Close'
import Media from '../../../theme/media'
import { CheckoutFooter } from './CheckoutStyles'

interface WrapperProps {
  hideCheckout: (...args: any[]) => any
  allowClose: boolean
  bgColor?: string
  back: () => void | null
  showBack: boolean
}

interface WrapperStyleProps {
  bgColor: string
}

const CheckoutWrapper: React.FunctionComponent<WrapperProps> = ({
  children,
  back,
  hideCheckout,
  allowClose = true,
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
      <CheckoutFooter showBack={showBack} back={back} />
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
  align-items: center;
  background-color: ${(props: WrapperStyleProps) => props.bgColor};
  color: var(--darkgrey);
  border-radius: 4px;
  position: relative;
  box-shadow: 0px 0px 60px rgba(0, 0, 0, 0.25);
  ${Media.nophone`
    width: 380px;
  `}
  ${Media.phone`
    width: 100%;
    height: 100vh;
  `}
`
