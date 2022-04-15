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
  lockAddress?: string,
  singleKeyPrice?: string
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

    /*
      we need to exclude user metadata that already already exists,
      by creating a new array without items in "ignoreRecipients"
     */
    const listWithoutExcluded = recipientsList().filter(
      ({ resolvedAddress }) => {
        const exludedAddressList = (ignoreRecipients ?? []).map(
          ({ userAddress }) => userAddress
        )
        const isAddressExcluded =
          (exludedAddressList?.length > 0 &&
            exludedAddressList.includes(resolvedAddress)) ||
          exludedAddressList.length === 0
        return isAddressExcluded
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
    if (!singleKeyPrice) return
    const owners = recipientsList().map(
      ({ resolvedAddress }) => resolvedAddress
    )

    await purchaseMultipleKeys({
      walletService,
      lockAddress,
      owners,
      keyPrices: new Array(owners.length).fill(singleKeyPrice),
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

  const submit = async (ignoreRecipients?: User[]) => {
    const res = await submitBulkRecipients(ignoreRecipients)
    if (res) {
      const result: any = await res.json()
      const errorCodes = [500, 401, 404, 409]
      if (errorCodes.includes(res.status)) {
        ToastHelper.error(result?.message ?? 'Ops, something went wrong')
        if (retryBulkAction) {
          ToastHelper.success('Re-try bulk submit')
          setRetryBulkAction(false)
          submit(result?.users ?? [])
        }
      } else {
        ToastHelper.success('Success')
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
