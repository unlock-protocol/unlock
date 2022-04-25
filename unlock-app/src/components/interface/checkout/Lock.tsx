import React, { useState, useContext, useEffect } from 'react'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import {
  lockKeysAvailable,
  numberOfAvailableKeys,
  convertedKeyPrice,
  formattedKeyPrice,
} from '../../../utils/checkoutLockUtils'
import * as LockVariations from './LockVariations'
import { useLock } from '../../../hooks/useLock'
import { ConfigContext } from '../../../utils/withConfig'

interface LockProps {
  lock: any
  setHasKey: (state: boolean) => void
  onSelected: ((lock: any) => void) | null
  network: number
  name: string
  hasOptimisticKey: boolean
  purchasePending: boolean
  recipient?: string
  onLoading?: (state: boolean) => void
  numberOfRecipients?: number
}

const getLockProps = (
  lock: any,
  network: number,
  baseCurrencySymbol: string,
  name: string,
  numberOfRecipients = 1
) => {
  return {
    cardEnabled: lock?.fiatPricing?.creditCardEnabled,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: formattedKeyPrice(
      lock,
      baseCurrencySymbol,
      numberOfRecipients
    ),
    convertedKeyPrice: convertedKeyPrice(lock, numberOfRecipients),
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: name || lock.name,
    address: lock.address,
    network,
    prepend: numberOfRecipients > 1 ? `${numberOfRecipients} x ` : '',
  }
}
export const Lock = ({
  network,
  lock,
  setHasKey,
  name,
  onSelected,
  hasOptimisticKey,
  purchasePending,
  recipient,
  onLoading,
  numberOfRecipients,
}: LockProps) => {
  const config = useContext(ConfigContext)
  const [loading, setLoading] = useState(false)
  const { getKeyForAccount } = useLock(lock, network)
  const [hasValidKey, setHasValidKey] = useState(hasOptimisticKey)

  const alreadyHasKey = (key: any) => {
    const now = new Date().getTime() / 1000
    const { expiration } = key ?? {}
    const isKeyNotExpired = expiration > now || expiration === -1
    const isKeyValid = !!(key && isKeyNotExpired)
    setHasValidKey(isKeyValid)
    setHasKey(key)
  }

  useEffect(() => {
    if (typeof onLoading === 'function') {
      onLoading(loading)
    }
  }, [loading])

  useEffect(() => {
    const getKey = async () => {
      setLoading(true)
      alreadyHasKey(await getKeyForAccount(recipient))
      setLoading(false)
    }

    if (recipient) {
      getKey()
    } else {
      alreadyHasKey(null)
    }
  }, [recipient])

  const onClick = async () => {
    onSelected && onSelected(lock)
  }

  const lockProps: any = {
    onClick,
    ...getLockProps(
      lock,
      network,
      config.networks[network].baseCurrencySymbol,
      name,
      numberOfRecipients || 1
    ),
    selectable: true, // by default!
  }

  if (loading) {
    return (
      <LockVariations.LoadingLock address={lock.address} network={network} />
    )
  }

  const isSoldOut = numberOfAvailableKeys(lock) <= 0
  if (isSoldOut) {
    return <LockVariations.SoldOutLock {...lockProps} />
  }

  if (hasValidKey || hasOptimisticKey) {
    return <LockVariations.ConfirmedLock {...lockProps} selectable={false} />
  }

  if (purchasePending) {
    return <LockVariations.ProcessingLock {...lockProps} />
  }

  return (
    <LockVariations.PurchaseableLock {...lockProps} selectable={!!onSelected} />
  )
}

Lock.defaultProps = {
  recipient: '',
  onLoading: () => undefined,
  numberOfRecipients: 1,
}
