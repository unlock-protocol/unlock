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
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { ConfigContext } from '../../../utils/withConfig'

interface LockProps {
  lock: any
  setHasKey: (state: boolean) => void
  onSelected: ((lock: any) => void) | null
  network: number
  name: string
  hasOptimisticKey: boolean
  purchasePending: boolean
}

const getLockProps = (
  lock: any,
  network: number,
  baseCurrencySymbol: string,
  name: string
) => {
  return {
    cardEnabled: lock?.fiatPricing?.creditCardEnabled,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: formattedKeyPrice(lock, baseCurrencySymbol),
    convertedKeyPrice: convertedKeyPrice(lock),
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: name || lock.name,
    address: lock.address,
    network,
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
}: LockProps) => {
  const config = useContext(ConfigContext)
  const [loading, setLoading] = useState(false)
  const { account } = useContext(AuthenticationContext)
  const { getKeyForAccount } = useLock(lock, network)
  const [hasValidKey, setHasValidKey] = useState(hasOptimisticKey)

  const alreadyHasKey = (key: any) => {
    const now = new Date().getTime() / 1000
    if (key && key.expiration > now) {
      setHasValidKey(true)
    } else {
      setHasValidKey(false)
    }
    setHasKey(key)
  }

  useEffect(() => {
    const getKey = async () => {
      setLoading(true)
      alreadyHasKey(await getKeyForAccount(account))
      setLoading(false)
    }

    if (account) {
      getKey()
    } else {
      setHasValidKey(false)
    }
  }, [account])

  const onClick = async () => {
    onSelected && onSelected(lock)
  }

  const lockProps: LockVariations.LockProps = {
    onClick,
    ...getLockProps(
      lock,
      network,
      config.networks[network].baseCurrencySymbol,
      name
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

Lock.defaultProps = {}
