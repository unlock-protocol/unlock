import React from 'react'
import styled from 'styled-components'
import Close from '../interface/buttons/layout/Close'
import Media from '../../theme/media'
import { CheckoutFooter } from './CheckoutStyles'

interface WrapperProps {
  children: any
  hideCheckout: (...args: any[]) => any
  allowClose: boolean
  icon?: string
  callToAction: string
  bgColor?: string
  onClick?: (event: any) => void
}

interface WrapperStyleProps {
  bgColor: string
}

const CheckoutWrapper = ({
  children,
  icon,
  callToAction,
  hideCheckout,
  bgColor = 'var(--offwhite)',
  onClick = () => {},
  allowClose = true,
}: WrapperProps) => {
  const callToActionParagraphs = callToAction
    .split('\n')
    .map((paragraph, index) => {
      // eslint-disable-next-line react/no-array-index-key
      return <p key={index}>{paragraph}</p>
    })

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
      <Header>
        <Title>{icon && <Logo src={icon} />}</Title>
        {callToActionParagraphs}
      </Header>
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

const Header = styled.header`
  display: grid;
  margin-bottom: 20px;
  p {
    font-size: 20px;
    margin: 5px;
  }
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 200;
  vertical-align: middle;
`

const Logo = styled.img`
  max-height: 100px;
  max-width: 200px;
`
