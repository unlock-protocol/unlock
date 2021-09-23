import React from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'
import Svg from '../svg'

interface CheckoutMethodProps {
  onWalletSelected: () => void
  lock: any
  showLogin: () => void
  onNewAccountSelected: () => void
  onNewAccountWithCardSelected: () => void
}

export const CheckoutMethod = ({
  lock,
  onWalletSelected,
  showLogin,
  onNewAccountSelected,
  onNewAccountWithCardSelected,
}: CheckoutMethodProps) => {
  const isCreditCardEnabled = lock.fiatPricing?.creditCardEnabled

  if (lock.keyPrice === '0' && lock.fiatPricing?.creditCardEnabled) {
    // We can grant keys for free!
    return (
      <Wrapper>
        <MainChoice onClick={onNewAccountSelected}>
          <Icon>
            <Svg.Person />
          </Icon>
          Create account to claim NFT
        </MainChoice>
        <SecondChoice onClick={onWalletSelected}>
          <Icon>
            <Svg.Wallet />
          </Icon>
          Connect your crypto Wallet
        </SecondChoice>
        <SecondChoice onClick={showLogin}>
          <Icon>
            <Svg.Person />
          </Icon>
          Already have an Unlock account?
        </SecondChoice>
      </Wrapper>
    )
  }
  return (
    <Wrapper>
      {isCreditCardEnabled && (
        <>
          <MainChoice onClick={onNewAccountWithCardSelected}>
            <Icon>
              <Svg.CreditCard />
            </Icon>
            Pay with Credit Card
          </MainChoice>
          <SecondChoice onClick={onWalletSelected}>
            <Icon>
              <Svg.Wallet />
            </Icon>
            Connect your crypto Wallet
          </SecondChoice>
          <SecondChoice onClick={showLogin}>
            <Icon>
              <Svg.Person />
            </Icon>
            Already have an Unlock account?
          </SecondChoice>
        </>
      )}
      {!isCreditCardEnabled && (
        <>
          <MainChoice default={!isCreditCardEnabled} onClick={onWalletSelected}>
            <Icon>
              <Svg.Wallet />
            </Icon>
            Connect your crypto Wallet
          </MainChoice>
          <SecondChoice onClick={showLogin}>
            <Icon>
              <Svg.Unlock />
            </Icon>
            Already have an Unlock account?
          </SecondChoice>
          <SecondChoice disabled>
            <Icon>
              <Svg.CreditCard />
            </Icon>
            Credit card unavailable for this lock
          </SecondChoice>
        </>
      )}
    </Wrapper>
  )
}

export default CheckoutMethod

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
const Icon = styled.div`
  margin-right: 10px;
  border-radius: 50%;
  width: 30px;
  height: 30px;

  svg {
    fill: var(--blue);
  }
`

const MainChoice = styled(ActionButton).attrs({
  color: 'var(--white)',
  activeColor: 'var(--white)',
  fontColor: 'var(--blue)',
  fontActiveColor: 'var(--blue)',
  borderColor: 'transparent',
  activeBorderColor: 'var(--blue)',
})`
  border: 1px solid var(--white);
  &:hover {
    border: 1px solid var(--blue);
  }
  display: flex;
  margin: 10px 0px;
  color: var(--blue);
  align-items: center;

  ${Icon} {
    background-color: var(--blue);
    border: 1px solid var(--blue);
    width: 32px;
    height: 32px;

    svg {
      fill: var(--white);
    }
  }
`

const SecondChoice = styled.a`
  display: flex;
  color: ${(props) => (props.disabled ? 'var(--grey)' : 'var(--blue)')};
  align-items: center;
  font-size: 14px;
  margin: 5px 20px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  ${Icon} {
    background-color: ${(props) =>
      props.disabled ? 'var(--grey)' : 'var(--blue)'};
    width: 20px;
    height: 20px;

    svg {
      fill: var(--white);
    }
  }
`
