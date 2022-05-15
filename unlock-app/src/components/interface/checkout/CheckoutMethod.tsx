import React from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'
import Svg from '../svg'
import { inClaimDisallowList } from '../../../utils/checkoutLockUtils'

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
  const isCreditCardEnabled =
    lock.fiatPricing?.creditCardEnabled && lock.keyPrice !== '0'
  const isGrantPossible =
    lock.keyPrice === '0' &&
    lock.fiatPricing?.creditCardEnabled &&
    !inClaimDisallowList(lock.address)

  return (
    <Wrapper>
      <MainChoice onClick={onWalletSelected}>
        <Icon>
          <Svg.Wallet />
        </Icon>
        Connect your crypto Wallet
      </MainChoice>
      {isGrantPossible && (
        <SecondChoice onClick={onNewAccountSelected}>
          <Icon>
            <Svg.Person />
          </Icon>
          Create account to claim NFT
        </SecondChoice>
      )}
      {isCreditCardEnabled && (
        <SecondChoice onClick={onNewAccountWithCardSelected}>
          <Icon>
            <Svg.CreditCard />
          </Icon>
          Create account and pay by card
        </SecondChoice>
      )}
      <SecondChoice onClick={showLogin}>
        <Icon>
          <Svg.Unlock />
        </Icon>
        Already have an Unlock account?
      </SecondChoice>
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

interface SecondChoiceProps {
  disabled?: boolean
}

const SecondChoice = styled.a<SecondChoiceProps>`
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
SecondChoice.defaultProps = {
  disabled: false,
}
