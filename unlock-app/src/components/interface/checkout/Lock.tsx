import React, { useState, useContext, useEffect } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { CallToAction } from './CallToAction'
import { PaywallConfigContext } from '../../../contexts/PaywallConfigContext'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { useFiatPurchaseKey } from '../../../hooks/useFiatPurchaseKey'
import MetadataForm from './MetadataForm'
import {
  lockKeysAvailable,
  numberOfAvailableKeys,
  lockTickerSymbol,
  userCanAffordKey,
} from '../../../utils/checkoutLockUtils'
import * as LockVariations from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { useAccount } from '../../../hooks/useAccount'
import { useLock } from '../../../hooks/useLock'
import { AuthenticationContext } from '../Authenticate'
import { useFiatKeyPrices } from '../../../hooks/useFiatKeyPrices'
import { ConfigContext } from '../../../utils/withConfig'
import { WalletServiceContext } from '../../../utils/withWalletService'
import {
  getCardsForAddress,
  saveCardsForAddress,
} from '../../../hooks/useCards'
import { PaymentDetails } from '../user-account/PaymentDetails'

interface LockProps {
  lock: any
  emitTransactionInfo: (info: TransactionInfo) => void
  authenticated: boolean
  activePayment: string
  setFocus: (address: string) => void
}

const getLockProps = (lock: any, baseCurrencySymbol: string) => {
  return {
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: `${lock.keyPrice} ${lockTickerSymbol(
      lock,
      baseCurrencySymbol
    )}`,
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: lock.name, // TODO: take name override into account
    address: lock.address,
  }
}

export const LoggedOutLock = ({ lock, onClick, network }: any) => {
  const config = useContext(ConfigContext)
  const baseCurrencySymbol = config.networks[network].baseCurrencySymbol

  const lockProps = {
    ...getLockProps(lock, baseCurrencySymbol),
    onClick,
  }
  return <LockVariations.PurchaseableLock {...lockProps} />
}

export const Lock = ({
  lock,
  emitTransactionInfo,
  activePayment,
  setFocus,
}: LockProps) => {
  const config = useContext(ConfigContext)
  const walletService: WalletService = useContext(WalletServiceContext)

  // Let's see if we can load the prices here!
  const paywallConfig = useContext(PaywallConfigContext)
  const { account, network } = useContext(AuthenticationContext)
  const { purchaseKey, getKeyForAccount } = useLock(lock)
  const [showMetadataForm, setShowMetadataForm] = useState(false)
  const [captureCreditCard, setCaptureCreditCard] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [canAfford, setCanAfford] = useState(true)
  const [purchasePending, setPurchasePending] = useState(false)
  const { getTokenBalance } = useAccount(account)
  const { fiatPrices } = useFiatKeyPrices(lock.address, activePayment)

  const { purchaseKey: fiatPurchaseKey } = useFiatPurchaseKey(
    emitTransactionInfo
  )
  // TODO: combine all of these into a single call so that we can show the loading state?
  useEffect(() => {
    const getKey = async () => {
      const key = await getKeyForAccount(account)
      const now = new Date().getTime() / 1000
      setHasKey(key && key.expiration > now)
    }
    getKey()

    const getBalance = async () => {
      const balance = await getTokenBalance(lock.currencyContractAddress)
      setCanAfford(userCanAffordKey(lock, balance))
    }
    getBalance()
  }, [account, lock.address, lock.keyPrice])

  // Actual purchase
  const purchase = async () => {
    try {
      if (activePayment === 'Credit Card') {
        const cards = await getCardsForAddress(config, walletService, account)
        if (cards.length === 0) {
          // Show card form!
          setCaptureCreditCard(true)
          setFocus(lock.address)
        } else {
          // Here we would want to make sure the user agreed by showing the confirmation screen?
          setPurchasePending(true)
          await fiatPurchaseKey(lock.address, account)
          setHasKey(true) // optimistic Unlocking!
        }
      } else {
        const referrer =
          paywallConfig && paywallConfig.referrer
            ? paywallConfig.referrer
            : account
        setPurchasePending(true)
        purchaseKey(account, referrer, (transaction: any) => {
          setHasKey(true) // optimistic Unlocking!
          emitTransactionInfo(transaction)
        })
      }
    } catch (error) {
      setPurchasePending(false)
    }
  }

  const onClick = async () => {
    // First check if the user is logged in. If not, ask them to login...
    // If they are move on!
    if (
      paywallConfig.metadataInputs ||
      paywallConfig.locks[lock.address].metadataInputs
    ) {
      setFocus(lock.address)
      setShowMetadataForm(true)
    } else {
      purchase()
    }
  }

  const handleMetadataSubmitted = () => {
    setShowMetadataForm(false)
    purchase()
    setFocus('')
  }

  const handlePaymentDetails = async (stripeTokenId: string) => {
    setFocus('')
    setCaptureCreditCard(false)
    await saveCardsForAddress(config, walletService, account, stripeTokenId)
    purchase() // Finish the purchase!
  }

  if (showMetadataForm) {
    return (
      <>
        <CallToAction
          state="metadata"
          callToAction={paywallConfig.callToAction}
        />

        <MetadataForm
          lock={lock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={handleMetadataSubmitted}
          onCancel={() => {
            setFocus('')
            setShowMetadataForm(false)
          }}
        />
      </>
    )
  }
  if (captureCreditCard) {
    return (
      <>
        <CallToAction state="card" callToAction={paywallConfig.callToAction} />

        <PaymentDetails
          saveCard={(token) => handlePaymentDetails(token)}
          onCancel={() => {
            setFocus('')
            setCaptureCreditCard(false)
          }}

          // setShowingPaymentForm={setShowingPaymentForm}
          // invokePurchase={showingPaymentForm.invokePurchase!}
        />
      </>
    )
  }

  let disabled = false
  const lockProps: LockVariations.LockProps = {
    onClick,
    ...getLockProps(lock, config.networks[network].baseCurrencySymbol),
  }

  if (activePayment === 'Credit Card') {
    if (fiatPrices.usd) {
      const basePrice = parseInt(fiatPrices.usd)
      const formattedPrice = (basePrice / 100).toFixed(2)
      lockProps.formattedKeyPrice = `$${formattedPrice}`
    } else {
      disabled = true
    }
  }

  const isSoldOut = numberOfAvailableKeys(lock) === 0
  if (disabled) {
    return <LockVariations.DisabledLock {...lockProps} />
  }
  // Lock is sold out
  if (isSoldOut) {
    return <LockVariations.SoldOutLock {...lockProps} />
  }

  if (hasKey) {
    return <LockVariations.ConfirmedLock {...lockProps} />
  }

  if (purchasePending) {
    return <LockVariations.ProcessingLock {...lockProps} />
  }

  // TODO: consider that some other lock is being/has been purchased
  // if (state.purchasingLockAddress || activeKeys.length) {
  //   return <LockVariations.DisabledLock {...lockProps} />
  // }

  // No lock is being/has been purchased
  if (canAfford) {
    return <LockVariations.PurchaseableLock {...lockProps} />
  }

  return <LockVariations.InsufficientBalanceLock {...lockProps} />
}

Lock.defaultProps = {}
