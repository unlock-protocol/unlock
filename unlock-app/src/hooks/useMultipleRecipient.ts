import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { PaywallConfig } from '../unlockTypes'
import { ConfigContext } from '../utils/withConfig'
import { getAddressForName } from './useEns'

export interface RecipientItem {
  userAddress: string
  resolvedAddress: string
  valid: boolean
  index: number
  metadata?: { [key: string]: any }
  keyId?: string
}

interface RecipientPayload {
  users: {
    userAddress: string
    metadata: { [key: string]: any }
    lockAddress: string
  }[]
}

export const useMultipleRecipient = (
  paywallConfig?: PaywallConfig,
  lockAddress?: string
) => {
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const { maxRecipients = 1, locks } = paywallConfig ?? {}
  const lock = lockAddress ? locks?.[lockAddress] : {}

  const normalizeRecipients = () => {
    if (!lockAddress) return
    const payload: RecipientPayload = {
      users: recipientsList().map(({ resolvedAddress, metadata = {} }) => {
        return {
          userAddress: resolvedAddress,
          metadata,
          lockAddress,
        }
      }),
    }
    return payload
  }

  const clear = () => {
    setRecipients(new Set([]))
  }

  useEffect(() => {
    setHasMultipleRecipients(+maxRecipients > 1)
  }, [])

  const recipientsList = (): RecipientItem[] => {
    return Array.from(recipients)
  }

  const canAddUser = () => {
    return recipients.size < maxRecipients
  }

  const isAddressValid = async (recipient: string) => {
    const address = await getAddressForName(recipient)
    return {
      valid: address?.length > 0 ?? false,
      address,
    }
  }

  const submitBulkRecipients = async () => {
    if (!lock?.network) return
    const url = `${config.services.storage.host}/v2/api/metadata/${lock?.network}/users`
    const opts = {
      method: 'POST',
      body: JSON.stringify(normalizeRecipients()),
    }
    return (await fetch(url, opts)).json()
  }

  const submit = async () => {
    await ToastHelper.promise(submitBulkRecipients(), {
      success: 'Success',
      loading: 'Saving recipients',
      error: 'Ops, something went wrong',
    })
  }

  const addRecipientItem = async (
    userAddress = '',
    metadata = {}
  ): Promise<boolean> => {
    setLoading(true)
    if (canAddUser()) {
      const index = recipients?.size + 1
      const { valid, address } = await isAddressValid(userAddress)
      if (valid) {
        setRecipients(
          (prev) =>
            new Set(
              prev.add({
                userAddress,
                metadata,
                index,
                resolvedAddress: address ?? userAddress,
                valid,
              })
            )
        )
      }
      if (!valid) {
        ToastHelper.error(
          'Recipient address is not valid, please use a valid wallet address or ENS name.'
        )
      }
      setLoading(false)
      return Promise.resolve(valid)
    }
    ToastHelper.error("You can't add more recipients")
    setLoading(false)
    return Promise.resolve(false)
  }

  return {
    hasMultipleRecipients,
    recipients: recipientsList(),
    addRecipientItem,
    loading,
    maxRecipients,
    submitBulkRecipients: submit,
    clear,
  }
}
