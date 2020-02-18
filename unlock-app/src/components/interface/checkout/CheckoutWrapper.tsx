import React from 'react'
import styled from 'styled-components'
import Close from '../buttons/layout/Close'
import Media from '../../../theme/media'
import { CheckoutFooter } from './CheckoutStyles'

interface WrapperProps {
  children: any
  hideCheckout: (...args: any[]) => any
  allowClose: boolean
  bgColor?: string
  onClick?: (event: any) => void
  icon?: string
}

interface WrapperStyleProps {
  bgColor: string
}

const CheckoutWrapper = ({
  children,
  hideCheckout,
  bgColor = 'var(--offwhite)',
  onClick = () => {},
  allowClose = true,
  icon,
}: WrapperProps) => {
  return (
    <Wrapper bgColor={bgColor} onClick={allowClose ? onClick : () => {}}>
      {allowClose ? (
        <CloseButton
          backgroundColor="var(--lightgrey)"
          fillColor="var(--grey)"
          onClick={hideCheckout}
        />
      ) : (
        ''
      )}
      <header>
        <Title>{icon && <Logo src={icon} />}</Title>
      </header>
      {children}
      <CheckoutFooter />
    </Wrapper>
  )
}

export default CheckoutWrapper

const CloseButton = styled(Close).attrs(() => ({
  className: 'closeButton',
}))`
  position: absolute;
  top: 24px;
  right: 24px;
`

const Wrapper = styled.section`
  padding: 10px 40px;
  display: flex;
  flex-direction: column;
  background-color: ${(props: WrapperStyleProps) => props.bgColor};
  color: var(--darkgrey);
  border-radius: 4px;
  position: relative;
  ${Media.nophone`
width: 600px;
`}
  ${Media.phone`
width: 100%;
`}
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 200;
  vertical-align: middle;
`

const Logo = styled.img`
  max-height: 47px;
  max-width: 200px;
`
