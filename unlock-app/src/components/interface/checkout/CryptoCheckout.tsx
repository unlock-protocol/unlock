import React, { useContext, useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Lock } from './Lock'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import { useLock } from '../../../hooks/useLock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { PaywallConfig } from '../../../unlockTypes'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import { useAccount } from '../../../hooks/useAccount'
import {
  inClaimDisallowList,
  userCanAffordKey,
} from '../../../utils/checkoutLockUtils'
import Buttons from '../buttons/lock'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'
import { getAddressForName } from '../../../hooks/useEns'

import { Input, Label, SmallButton } from './FormStyles'

interface CryptoCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  paywallConfig: PaywallConfig
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  setCardPurchase: () => void
  redirectUri?: string
}

export const CryptoCheckout = ({
  emitTransactionInfo,
  paywallConfig,
  lock,
  network,
  name,
  closeModal,
  setCardPurchase,
  redirectUri,
}: CryptoCheckoutProps) => {
  const { networks } = useContext(ConfigContext)

  const {
    network: walletNetwork,
    account,
    changeNetwork,
    isUnlockAccount,
  } = useContext(AuthenticationContext)
  const { purchaseKey } = useLock(lock, network)
  const [transactionPending, setTransactionPending] = useState<string>('')
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [canAfford, setCanAfford] = useState(true)
  const [purchasePending, setPurchasePending] = useState(false)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [recipient, setRecipient] = useState<string>('')
  const [recipientValid, setRecipientValid] = useState(false)
  const [checkingRecipient, setCheckingRecipient] = useState(false)
  const userIsOnWrongNetwork = walletNetwork && walletNetwork !== network
  // @ts-expect-error account is _always_ defined in this component
  const { getTokenBalance } = useAccount(account, network)

  const now = new Date().getTime() / 1000
  const hasValidkey = keyExpiration > now && keyExpiration < Infinity
  const hasOptimisticKey = keyExpiration === Infinity
  const cryptoDisabled =
    userIsOnWrongNetwork || hasValidkey || hasOptimisticKey || !canAfford
  const cardDisabled = hasValidkey || hasOptimisticKey

  const canClaimAirdrop =
    lock.keyPrice === '0' &&
    lock.fiatPricing?.creditCardEnabled &&
    !inClaimDisallowList(lock.address)
  const isCreditCardEnabled =
    lock.fiatPricing?.creditCardEnabled &&
    !canClaimAirdrop &&
    lock.keyPrice !== '0'

  const handleHasKey = (key: any) => {
    setKeyExpiration(key.expiration)
  }

  const connectToNetwork = () => {
    changeNetwork(networks[network])
  }

  const cryptoPurchase = async () => {
    if (!cryptoDisabled) {
      setPurchasePending(true)
      try {
        const referrer =
          paywallConfig && paywallConfig.referrer
            ? paywallConfig.referrer
            : account

        // TODO: handle failed transactions!!
        await purchaseKey(account, referrer, (hash: string) => {
          emitTransactionInfo({
            lock: lock.address,
            hash,
          })
          if (!paywallConfig.pessimistic) {
            setKeyExpiration(Infinity) // Optimistic!
            setPurchasePending(false)
          } else {
            setTransactionPending(hash)
          }
        })
        setKeyExpiration(Infinity) // We should actually get the real expiration
        setPurchasePending(false)
        setTransactionPending('')
      } catch (error: any) {
        console.error(error)
        if (error?.code === 4001) {
          // eslint-disable-next-line no-alert
          alert('Please confirm the transaction in your wallet.')
        }
        setPurchasePending(false)
      }
    }
  }

  useEffect(() => {
    const getBalance = async () => {
      if (account) {
        try {
          const balance = await getTokenBalance(lock.currencyContractAddress)
          setCanAfford(userCanAffordKey(lock, balance))
        } catch (error: any) {
          console.error(error)
        }
      }
    }
    getBalance()
  }, [account, lock.address, walletNetwork])

  useEffect(() => {
    if (isAdvanced) return
    setRecipientValid(true)
    setRecipient('')
  }, [isAdvanced])

  const onRecipientChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setRecipientValid(false)
    setRecipient(value)
    setCheckingRecipient(true)
    const address = await getAddressForName(value)
    setCheckingRecipient(false)
    if (address) {
      setRecipient(address)
      setRecipientValid(true)
    }
  }

  const onCardPurchase = useCallback((isDisabled = false) => {
    if (isDisabled) return
    setCardPurchase()
  }, [])

  const advancedRecipientValid = isAdvanced
    ? recipient?.length > 0 && recipientValid
    : true

  return (
    <>
      <Lock
        network={network}
        lock={lock}
        name={name}
        setHasKey={handleHasKey}
        onSelected={null}
        hasOptimisticKey={hasOptimisticKey}
        purchasePending={purchasePending}
      />
      <SmallButton onClick={() => setIsAdvanced(!isAdvanced)}>
        {isAdvanced ? 'Close advanced' : 'Advanced'}
      </SmallButton>
      {isAdvanced && (
        <>
          <Label>Recipient</Label>
          <Input
            type="text"
            placeholder="Recipient address"
            name="recipient"
            onChange={onRecipientChange}
            style={{ marginBottom: '0.2rem' }}
          />
          {!advancedRecipientValid && !checkingRecipient && (
            <Warning style={{ marginTop: '0px' }}>
              Enter a valid recipient address
            </Warning>
          )}
        </>
      )}

      {!transactionPending && keyExpiration < now && (
        <>
          <Prompt>Get your membership with:</Prompt>

          <CheckoutOptions>
            <CheckoutButton
              disabled={cryptoDisabled || !advancedRecipientValid}
            >
              <Buttons.Wallet as="button" onClick={cryptoPurchase} />
              {!isUnlockAccount && userIsOnWrongNetwork && !hasValidkey && (
                <Warning>
                  Crypto wallet on wrong network.{' '}
                  <LinkButton onClick={connectToNetwork}>
                    Connect to {ETHEREUM_NETWORKS_NAMES[network]}{' '}
                  </LinkButton>
                  .
                </Warning>
              )}
              {!isUnlockAccount &&
                !userIsOnWrongNetwork &&
                !hasValidkey &&
                !canAfford && <Warning>Your balance is too low</Warning>}
            </CheckoutButton>

            <CheckoutButton
              disabled={!isCreditCardEnabled || !advancedRecipientValid}
            >
              <Buttons.CreditCard
                lock={lock}
                backgroundColor="var(--blue)"
                fillColor="var(--white)"
                showLabel
                size="36px"
                disabled={cardDisabled}
                as="button"
                onClick={() => onCardPurchase(cardDisabled)}
              />
            </CheckoutButton>

            {canClaimAirdrop && (
              <CheckoutButton>
                <Buttons.AirDrop
                  lock={lock}
                  backgroundColor="var(--blue)"
                  fillColor="var(--white)"
                  showLabel
                  size="36px"
                  as="button"
                  onClick={onCardPurchase}
                />
              </CheckoutButton>
            )}
          </CheckoutOptions>
        </>
      )}
      {transactionPending && (
        <Message>
          Waiting for your{' '}
          <a
            target="_blank"
            href={networks[network].explorer.urls.transaction(
              transactionPending
            )}
            rel="noreferrer"
          >
            NFT membership to be minted
          </a>
          ! This should take a few seconds :)
        </Message>
      )}
      {hasValidkey && (
        <>
          <Message>You already have a valid membership for this lock!</Message>
          <EnjoyYourMembership
            redirectUri={redirectUri}
            closeModal={closeModal}
          />
        </>
      )}
      {hasOptimisticKey && (
        <EnjoyYourMembership
          redirectUri={redirectUri}
          closeModal={closeModal}
        />
      )}
    </>
  )
}

export default CryptoCheckout

CryptoCheckout.defaultProps = {
  redirectUri: '',
}

interface CheckoutButtonProps {
  disabled?: boolean
}

export const CheckoutButton = styled.div<CheckoutButtonProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0px 20px;
  ${(props) =>
    props.disabled &&
    `
    button {
      cursor: not-allowed;
      background-color: var(--grey);

      &:hover {
        background-color: var(--grey);
      }
    }`}

  small {
    display: inline-block;
    color: ${(props) => (props.disabled ? 'var(--grey)' : 'var(--blue)')};
  }
`

CheckoutButton.defaultProps = {
  disabled: false,
}

const LinkButton = styled.a`
  cursor: pointer;
`

const Message = styled.p`
  text-align: left;
  font-size: 13px;
  width: 100%;
`
const Warning = styled(Message)`
  color: var(--red);
  margin-top: 24px;
  font-size: 12px;
  text-align: center;
`

const Success = styled(Warning)`
  color: var(--green);
`

const CheckoutOptions = styled.div`
  width: 50%;
  display: flex;
  justify-content: space-around;
  margin-left: auto;
  margin-right: auto;
`

const Prompt = styled.p`
  font-size: 16px;
  color: var(--dimgrey);
`
