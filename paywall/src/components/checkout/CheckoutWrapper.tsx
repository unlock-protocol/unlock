import React from 'react'
import styled from 'styled-components'
import Media from '../../theme/media'
import Close from '../interface/buttons/layout/Close'

interface WrapperProps {
  children: any
  hideCheckout: (...args: any[]) => any
  bgColor?: string
  onClick?: (event: any) => void
  showCheckout?: boolean
}

interface WrapperStyleProps {
  bgColor: string
}

const CheckoutWrapper = ({
  children,
  hideCheckout,
  bgColor = 'var(--offwhite)',
  onClick = () => {},
  showCheckout = true,
}: WrapperProps) => {
  return (
    <Wrapper bgColor={bgColor} onClick={onClick}>
      {showCheckout ? (
        <CloseButton
          backgroundColor="var(--lightgrey)"
          fillColor="var(--grey)"
          onClick={hideCheckout}
        />
      ) : (
        ''
      )}
      {children}
    </Wrapper>
  )
}

export default CheckoutWrapper

const CloseButton = styled(Close)`
  position: absolute;
  top: 24px;
  right: 24px;
`

const Wrapper = styled.section`
  max-width: 800px;
  padding: 10px 40px;
  display: flex;
  flex-direction: column;
  background-color: ${(props: WrapperStyleProps) => props.bgColor};
  color: var(--darkgrey);
  border-radius: 4px;
  position: relative;

  ${Media.phone`
    display: grid;
  `}
`
