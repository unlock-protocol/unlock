import toast from 'react-hot-toast'
import React, { useContext, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha'
import { Lock } from './Lock'
import { CheckoutCustomRecipient } from './CheckoutCustomRecipient'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { useLock } from '../../../hooks/useLock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { PaywallConfig } from '../../../unlockTypes'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import { useAccount } from '../../../hooks/useAccount'
import { StorageService } from '../../../services/storageService'

import {
  inClaimDisallowList,
  lockTickerSymbol,
  userCanAffordKey,
} from '../../../utils/checkoutLockUtils'
import Buttons from '../buttons/lock'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'
import { useAdvancedCheckout } from '../../../hooks/useAdvancedCheckout'
import { ToastHelper } from '../../helpers/toast.helper'

interface CryptoCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  paywallConfig: PaywallConfig
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  setCardPurchase: () => void
  redirectUri?: string
  numberOfRecipients?: number
  recipients?: any[]
  clearMultipleRecipients?: () => void
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
  numberOfRecipients = 1,
  recipients = [],
  clearMultipleRecipients,
}: CryptoCheckoutProps) => {
  const { networks, services, recaptchaKey } = useContext(ConfigContext)
  const storageService = new StorageService(services.storage.host)
  const [loading, setLoading] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>('')
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
  const [purchasedMultiple, setPurchasedMultiple] = useState(false)
  const {
    isAdvanced,
    setIsAdvanced,
    onRecipientChange,
    advancedRecipientValid,
    recipient,
    checkingRecipient,
  } = useAdvancedCheckout()
  const { purchaseMultipleKeys } = useLock(lock.address, network)
  const userIsOnWrongNetwork = walletNetwork && walletNetwork !== network
  // @ts-expect-error account is _always_ defined in this component
  const { getTokenBalance } = useAccount(account, network)
  const loadingCheck = useRef(false)

  const now = new Date().getTime() / 1000
  const hasValidkey =
    keyExpiration === -1 || (keyExpiration > now && keyExpiration < Infinity)

  const hasOptimisticKey = keyExpiration === Infinity
  const hasValidOrPendingKey = hasValidkey || hasOptimisticKey

  const cryptoDisabled = userIsOnWrongNetwork || hasOptimisticKey || !canAfford
  const cardDisabled = hasOptimisticKey
  const canClaimAirdrop =
    lock.keyPrice === '0' &&
    lock.fiatPricing?.creditCardEnabled &&
    !inClaimDisallowList(lock.address)
  const isCreditCardEnabled =
    lock.fiatPricing?.creditCardEnabled &&
    !canClaimAirdrop &&
    lock.keyPrice !== '0'

  const withMultipleRecipients = numberOfRecipients > 1
  const hasRecipients = recipients?.length > 0

  const cantBuyWithCrypto = isAdvanced
    ? !(
        advancedRecipientValid &&
        canAfford &&
        !userIsOnWrongNetwork &&
        !hasValidkey
      )
    : cryptoDisabled

  const cantPurchaseWithCard = isAdvanced
    ? !(!hasValidkey && isCreditCardEnabled && advancedRecipientValid)
    : !isCreditCardEnabled

  const handleHasKey = (key: any) => {
    if (!key) {
      setKeyExpiration(0)
    } else {
      // setIsAdvanced(false)
      setKeyExpiration(key.expiration)
    }
  }

  const connectToNetwork = () => {
    changeNetwork(networks[network])
  }

  /**
   * Handling multiple purchases!
   * @returns
   */
  const onPurchaseMultiple = async () => {
    if (!lock.address) return
    if (!lock.keyPrice) return
    const owners = recipients?.map(({ resolvedAddress }) =>
      resolvedAddress.toLowerCase()
    )

    try {
      setPurchasePending(true)
      const keyPrices = new Array(owners.length).fill(lock.keyPrice)

      let data = new Array(owners.length).fill(null)
      // We need to handle the captcha here too!
      if (paywallConfig.captcha) {
        // get the secret from locksmith!
        const response = await storageService.getDataForRecipientsAndCaptcha(
          owners,
          recaptchaValue!
        )
        if (response.error || !response.signatures) {
          setPurchasePending(false)
          setRecaptchaValue('')
          toast.error(
            'The Captcha value could not ve verified. Please try again.'
          )
          return false
        }
        data = response.signatures
      }

      await purchaseMultipleKeys(
        lock.address,
        keyPrices,
        owners,
        data,
        (hash: string) => {
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
        }
      )
      setPurchasePending(false)
      setTransactionPending('')
      return true
    } catch (err: any) {
      ToastHelper.error(
        err?.error?.message ||
          'There was an error and we could not submit your purchase transaction'
      )
      setPurchasePending(false)
      setTransactionPending('')
      return false
    }
  }

  const cryptoPurchase = async () => {
    if (withMultipleRecipients) {
      const validPurchase = await onPurchaseMultiple()
      if (validPurchase) {
        setPurchasedMultiple(true)
        if (typeof clearMultipleRecipients === 'function') {
          // clear recipients list after transactions done
          clearMultipleRecipients()
        }
      }
    } else if (!cantBuyWithCrypto && account) {
      // TODO: we should not have a different path for single or multiple purchase!
      setPurchasePending(true)
      try {
        const referrer =
          paywallConfig && paywallConfig.referrer
            ? paywallConfig.referrer
            : account

        const purchaseAccount = isAdvanced
          ? recipient
          : recipients[0]?.resolvedAddress ?? account
        let data

        if (paywallConfig.captcha) {
          // get the secret from locksmith!
          const response = await storageService.getDataForRecipientsAndCaptcha(
            [purchaseAccount], // recipient
            recaptchaValue!
          )
          if (response.error) {
            setPurchasePending(false)
            setRecaptchaValue('')
            return toast.error(
              'The Captcha value could not ve verified. Please try again.'
            )
          }
          data = response.signatures[0]
        }
        await purchaseKey(purchaseAccount, referrer, data, (hash: string) => {
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
        if (error.message == 'Transaction failed') {
          // Transaction was sent but failed!
          toast.error(
            'Your purchase transaction failed. Please check a block explorer for more details.'
          )
        } else if (error?.code === 4001) {
          // Transaction was not sent
          toast.error('Please confirm the transaction in your wallet.')
        } else {
          // Other reason...
          toast.error(
            `This transaction could not be sent as it appears to fail. ${
              error?.error?.message || ''
            }`
          )
        }
        setPurchasePending(false)
        setTransactionPending('')
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

  const onCardPurchase = (isDisabled = false) => {
    if (isDisabled) return
    setCardPurchase()
  }

  const hasValidKeyOrPendingTx = hasValidOrPendingKey || transactionPending
  const showCheckoutButtons =
    ((recaptchaValue || !paywallConfig.captcha) &&
      !transactionPending &&
      !hasValidkey) ||
    (isAdvanced && hasValidKeyOrPendingTx && !transactionPending)

  const onLoading = (loading: boolean) => {
    setLoading(loading)
    loadingCheck.current = true
  }

  const showRedirectButton = (hasValidkey || purchasedMultiple) && !isAdvanced

  const enablePurchaseButton = withMultipleRecipients
    ? !purchasedMultiple && !transactionPending
    : showCheckoutButtons

  return (
    <>
      <Lock
        recipient={
          isAdvanced ? (advancedRecipientValid ? recipient : '') : account
        }
        network={network}
        lock={lock}
        name={name}
        setHasKey={handleHasKey}
        onSelected={null}
        hasOptimisticKey={hasOptimisticKey}
        purchasePending={purchasePending}
        onLoading={onLoading}
        numberOfRecipients={numberOfRecipients}
      />
      {!hasValidKeyOrPendingTx && !hasRecipients && !purchasedMultiple && (
        <>
          <CheckoutCustomRecipient
            isAdvanced={isAdvanced}
            advancedRecipientValid={advancedRecipientValid}
            checkingRecipient={checkingRecipient}
            setIsAdvanced={setIsAdvanced}
            onRecipientChange={onRecipientChange}
            loading={loading}
            disabled={(transactionPending?.length ?? 0) > 0 ?? false}
          />
        </>
      )}
      {hasValidkey && (
        <>
          <Message>
            {!isAdvanced
              ? 'You already have a valid membership!'
              : 'Recipient already has a valid membership!'}
            &nbsp;
          </Message>
          {!hasRecipients && !purchasedMultiple && (
            <CheckoutCustomRecipient
              isAdvanced={isAdvanced}
              advancedRecipientValid={advancedRecipientValid}
              checkingRecipient={checkingRecipient}
              setIsAdvanced={setIsAdvanced}
              onRecipientChange={onRecipientChange}
              customBuyMessage="Buy for a different address"
              disabled={transactionPending?.length > 0 ?? false}
              loading={loading}
            />
          )}
        </>
      )}
      {purchasedMultiple && <Message>Enjoy your memberships!</Message>}
      {enablePurchaseButton && (
        <div
          style={{
            marginBottom: '32px',
            display:
              (loading && !isAdvanced) || !loadingCheck.current
                ? 'none'
                : 'block',
          }}
        >
          <Prompt>
            {hasRecipients
              ? `Get your multiple membership (${numberOfRecipients} keys) with:`
              : 'Get the membership with:'}
          </Prompt>

          <CheckoutOptions>
            <CheckoutButton disabled={cantBuyWithCrypto || loading}>
              <Buttons.Wallet as="button" onClick={cryptoPurchase} />
              {!isUnlockAccount && userIsOnWrongNetwork && (
                <Warning>
                  Crypto wallet on wrong network.{' '}
                  <LinkButton onClick={connectToNetwork}>
                    Connect to {ETHEREUM_NETWORKS_NAMES[network]}{' '}
                  </LinkButton>
                  .
                </Warning>
              )}
              {!isUnlockAccount && !userIsOnWrongNetwork && !canAfford && (
                <Warning>
                  Your{' '}
                  {lockTickerSymbol(lock, networks[network].baseCurrencySymbol)}{' '}
                  balance is too low
                </Warning>
              )}
            </CheckoutButton>
            <CheckoutButton disabled={cantPurchaseWithCard || loading}>
              <Buttons.CreditCard
                lock={lock}
                backgroundColor="var(--blue)"
                fillColor="var(--white)"
                showLabel
                size="36px"
                disabled={cardDisabled}
                as="button"
                onClick={() => onCardPurchase(cantPurchaseWithCard)}
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
                  onClick={() => onCardPurchase(false)}
                />
              </CheckoutButton>
            )}
          </CheckoutOptions>
        </div>
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
      {showRedirectButton && (
        <EnjoyYourMembership
          redirectUri={redirectUri}
          closeModal={closeModal}
        />
      )}
      {hasOptimisticKey && (
        <EnjoyYourMembership
          redirectUri={redirectUri}
          closeModal={closeModal}
        />
      )}
      {paywallConfig.captcha && !recaptchaValue && (
        <ReCAPTCHA sitekey={recaptchaKey} onChange={setRecaptchaValue} />
      )}
    </>
  )
}

export default CryptoCheckout

CryptoCheckout.defaultProps = {
  redirectUri: '',
  numberOfRecipients: 1,
  recipients: [],
  clearMultipleRecipients: () => undefined,
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

const CheckoutOptions = styled.div`
  width: 50%;
  display: flex;
  justify-content: space-around;
  margin-left: auto;
  margin-right: auto;
  margin-top: 16px;
`

const Prompt = styled.p`
  font-size: 16px;
  color: var(--dimgrey);
`
