import React, { useState, useContext, useEffect } from 'react'
import { getLockProps } from '~/utils/lock'
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
      if (!recipient) return
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

  const lockProps = {
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

  if (lockProps.isSoldOut) {
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
