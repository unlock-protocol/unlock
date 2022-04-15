import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { PaywallConfig } from '../unlockTypes'
import { ConfigContext } from '../utils/withConfig'
import { WalletServiceContext } from '../utils/withWalletService'
import { getAddressForName } from './useEns'
import { purchaseMultipleKeys } from './useLock'

interface User {
  lockAddress: string
  userAddress: string
}
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
  account?: string,
  paywallConfig?: PaywallConfig,
  lockAddress?: string
) => {
  const walletService = useContext(WalletServiceContext)
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const [retryBulkAction, setRetryBulkAction] = useState(true)
  const { maxRecipients = 1, locks } = paywallConfig ?? {}
  const lock = lockAddress ? locks?.[lockAddress] : {}

  const normalizeRecipients = (ignoreRecipients?: User[]) => {
    if (!lockAddress) return

    const listWithoutExcluded = recipientsList().filter(
      ({ resolvedAddress }) => {
        return ignoreRecipients && ignoreRecipients?.length > 0
          ? !ignoreRecipients
              .map(({ userAddress }) => userAddress)
              .includes(resolvedAddress)
          : true
      }
    )

    const payload: RecipientPayload = {
      users: listWithoutExcluded.map(({ resolvedAddress, metadata = {} }) => {
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

  const addAccountToList = () => {
    addRecipientItem(account)
  }

  const purchaseBulk = async () => {
    if (!lockAddress) return
    const owners = recipientsList().map(
      ({ resolvedAddress }) => resolvedAddress
    )

    await purchaseMultipleKeys({
      walletService,
      lockAddress,
      owners,
    })
  }

  useEffect(() => {
    const activeMultiple = +maxRecipients > 1
    setHasMultipleRecipients(activeMultiple)
    if (activeMultiple) {
      addAccountToList()
    }
  }, [])

  const recipientsList = (): RecipientItem[] => {
    return Array.from(recipients)
  }

  const canAddUser = () => {
    return recipients.size < maxRecipients
  }

  const getAddressAndValidation = async (recipient: string) => {
    const address = await getAddressForName(recipient)
    return {
      valid: address?.length > 0 ?? false,
      address,
    }
  }

  const submitBulkRecipients = async (ignoreRecipients?: User[]) => {
    if (!lock?.network) return
    const url = `${config.services.storage.host}/v2/api/metadata/${lock?.network}/users`
    const opts = {
      method: 'POST',
      body: JSON.stringify(normalizeRecipients(ignoreRecipients)),
      headers: {
        'content-type': 'application/json',
      },
    }
    const response = await fetch(url, opts)
    return response
  }

  const submit = async (ignoreRecipients?: User[], callback?: () => void) => {
    const res = await submitBulkRecipients(ignoreRecipients)
    if (res) {
      const result: any = await res.json()
      const errorCodes = [500, 401, 404, 409]
      console.log(result, res)
      if (errorCodes.includes(res.status)) {
        ToastHelper.error(result?.message ?? 'Ops, something went wrong')
        if (retryBulkAction) {
          ToastHelper.success('Re-try bulk submit')
          setRetryBulkAction(false)
          submit(result?.users ?? [], callback)
        }
      } else {
        ToastHelper.success('Success')
        if (typeof callback === 'function') callback()
      }
    }
  }

  const addRecipientItem = async (
    userAddress = '',
    metadata = {}
  ): Promise<boolean> => {
    setLoading(true)
    if (canAddUser()) {
      const index = recipients?.size + 1
      const { valid, address } = await getAddressAndValidation(userAddress)
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
    purchaseBulk,
  }
}
