import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { PaywallConfig } from '../unlockTypes'
import { ConfigContext } from '../utils/withConfig'
import { getAddressForName } from './useEns'

export interface RecipientItem {
  userAddress: string
  valid: boolean
  index: number
  metadata?: { [key: string]: any }
  keyId?: string
}
export const useMultipleRecipient = (
  paywallConfig?: PaywallConfig,
  lockAddress?: string
) => {
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [isGroupValid, setIsGroupValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const { maxRecipients = 1, locks } = paywallConfig ?? {}
  const lock = lockAddress ? locks?.[lockAddress] : {}

  const normalizeRecipients = () => {
    return recipientsList().map(({ userAddress, metadata }) => {
      return {
        userAddress,
        metadata,
        lockAddress,
      }
    })
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
    const valid = await getAddressForName(recipient)
    return valid?.length > 0 ?? false
  }

  const validate = async () => {
    setLoading(true)
    const items = recipientsList()
    const validations = await Promise.all([
      ...items.map(({ userAddress }) => {
        return isAddressValid(userAddress)
      }),
    ])
    const isGroupValid = validations.every((validation) => validation)

    // add validation status for every item
    const itemsWithValidations = items.map((item, index) => {
      return {
        ...item,
        valid: validations[index],
      }
    })

    setRecipients(new Set(itemsWithValidations))
    setIsGroupValid(isGroupValid)
    setLoading(false)
  }

  const submitBulkRecipients = async () => {
    if (!lock?.network) return
    const url = `${config.services.storage.host}/users/${lock?.network}`
    const opts = {
      method: 'POST',
      body: JSON.stringify(normalizeRecipients()),
    }
    const res = await fetch(url, opts)
    return res.json()
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
      const valid = await isAddressValid(userAddress)
      if (valid) {
        setRecipients(
          (prev) =>
            new Set(
              prev.add({
                userAddress,
                metadata,
                index,
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
    isGroupValid,
    loading,
    maxRecipients,
    submitBulkRecipients: submit,
  }
}
