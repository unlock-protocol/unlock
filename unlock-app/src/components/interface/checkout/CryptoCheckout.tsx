import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Lock } from './Lock'
import { AuthenticationContext } from '../Authenticate'
import { useLock } from '../../../hooks/useLock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { PaywallConfig } from '../../../unlockTypes'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import { useAccount } from '../../../hooks/useAccount'
import { userCanAffordKey } from '../../../utils/checkoutLockUtils'
import Buttons from '../buttons/lock'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'

interface CryptoCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  paywallConfig: PaywallConfig
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  setCardPurchase: () => void
  redirectUri: string
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
  } = useContext(AuthenticationContext)
  const { purchaseKey } = useLock(lock, network)
  const [transactionPending, setTransactionPending] = useState<string>('')
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [canAfford, setCanAfford] = useState(true)
  const [purchasePending, setPurchasePending] = useState(false)
  const userIsOnWrongNetwork = walletNetwork && walletNetwork !== network
  const { getTokenBalance } = useAccount(account, network)

  const now = new Date().getTime() / 1000
  const hasValidkey = keyExpiration > now && keyExpiration < Infinity
  const hasOptimisticKey = keyExpiration === Infinity
  const cryptoDisabled =
    userIsOnWrongNetwork || hasValidkey || hasOptimisticKey || !canAfford
  const cardDisabled = hasValidkey || hasOptimisticKey
  const canClaimAirdrop =
    lock.keyPrice === '0' && lock.fiatPricing?.creditCardEnabled
  const isCreditCardEnabled =
    lock.fiatPricing?.creditCardEnabled && !canClaimAirdrop

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
        setTransactionPending(null)
      } catch (error) {
        if (error && error.code === 4001) {
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
        } catch (error) {
          console.error(error)
        }
      }
    }
    getBalance()
  }, [account, lock.address, walletNetwork])

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

      {!transactionPending && keyExpiration < now && (
        <>
          <Prompt>Get your membership with</Prompt>

          <CheckoutOptions>
            <CheckoutButton disabled={cryptoDisabled}>
              <Buttons.Wallet as="button" onClick={cryptoPurchase} />
              {userIsOnWrongNetwork && !hasValidkey && (
                <Warning>
                  Crypto wallet on wrong network.{' '}
                  <LinkButton onClick={connectToNetwork}>
                    Connect to {ETHEREUM_NETWORKS_NAMES[network]}{' '}
                  </LinkButton>
                  .
                </Warning>
              )}
              {!userIsOnWrongNetwork && !hasValidkey && !canAfford && (
                <Warning>Your balance is too low</Warning>
              )}
            </CheckoutButton>
            {isCreditCardEnabled && (
              <CheckoutButton>
                <Buttons.CreditCard
                  lock={lock}
                  backgroundColor="var(--blue)"
                  fillColor="var(--white)"
                  showLabel
                  size="36px"
                  disabled={cardDisabled}
                  as="button"
                  onClick={setCardPurchase}
                />
              </CheckoutButton>
            )}

            {canClaimAirdrop && (
              <CheckoutButton>
                <Buttons.AirDrop
                  lock={lock}
                  backgroundColor="var(--blue)"
                  fillColor="var(--white)"
                  showLabel
                  size="36px"
                  as="button"
                  onClick={setCardPurchase}
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

export const CheckoutButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

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
`

const Prompt = styled.p`
  font-size: 16px;
  color: var(--dimgrey);
`
