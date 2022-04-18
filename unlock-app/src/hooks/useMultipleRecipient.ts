import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { PaywallConfig } from '../unlockTypes'
import { ConfigContext } from '../utils/withConfig'
import { WalletServiceContext } from '../utils/withWalletService'
import { getAddressForName } from './useEns'
import { purchaseMultipleKeys } from './useLock'

const MAX_RETRY_COUNT = 5
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
  paywallConfig?: PaywallConfig,
  lockAddress?: string,
  singleKeyPrice?: string
) => {
  const walletService = useContext(WalletServiceContext)
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const [retryCount, setRetryCount] = useState(0)
  const [ignoreRecipients, setIgnoreRecipients] = useState<User[]>([])
  const { maxRecipients = 1, locks } = paywallConfig ?? {}
  const lock = lockAddress ? locks?.[lockAddress] : {}

  const normalizeRecipients = () => {
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

  const purchaseBulk = async () => {
    if (!lockAddress) return
    if (!singleKeyPrice) return
    const owners = recipientsList().map(
      ({ resolvedAddress }) => resolvedAddress
    )

    try {
      await purchaseMultipleKeys({
        walletService,
        lockAddress,
        owners,
        keyPrices: new Array(owners.length).fill(singleKeyPrice),
      })
      return true
    } catch (err: any) {
      console.error(err)
      ToastHelper.error(
        err?.error?.message || 'Ops, error during multiple purchase'
      )
      return false
    }
  }

  useEffect(() => {
    const activeMultiple = +maxRecipients > 1
    setHasMultipleRecipients(activeMultiple)
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

  const submitBulkRecipients = async () => {
    if (!lock?.network) return
    const url = `${config.services.storage.host}/v2/api/metadata/${lock?.network}/users`
    const opts = {
      method: 'POST',
      body: JSON.stringify(normalizeRecipients()),
      headers: {
        'content-type': 'application/json',
      },
    }
    const response = await fetch(url, opts)
    return response
  }

  const submit = async (): Promise<boolean> => {
    if (retryCount < MAX_RETRY_COUNT) {
      const res = await submitBulkRecipients()
      if (res) {
        const result: any = await res.json()
        const errorCodes = [500, 401, 404]
        const successCodes = [200, 201]
        setIgnoreRecipients([])

        if (res.status === 409) {
          const addressesWithMetadata = result?.users?.map(
            ({ userAddress }: any) => userAddress
          )
          setIgnoreRecipients(addressesWithMetadata)
          setRetryCount(retryCount + 1)
          ToastHelper.error(`${result?.message}` ?? 'Ops, something went wrong')
        }

        if (errorCodes.includes(res.status)) {
          ToastHelper.error(result?.message ?? 'Ops, something went wrong')
          setRetryCount(retryCount + 1)
        }

        if (successCodes.includes(res.status)) {
          ToastHelper.success('Success')
          return true
        }
      }
      return false
    }
    ToastHelper.error('Retry count reached')
    return false
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

  const removeRecipient = (address: string) => {
    const newRecipientsList = recipientsList().filter(
      ({ userAddress }) => userAddress !== address
    )
    setRecipients(new Set(newRecipientsList))
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
    removeRecipient,
  }
}
