import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { ConfigContext } from '../utils/withConfig'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { getAddressForName } from './useEns'

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
  lockAddress: string,
  network?: number,
  maxRecipients = 1
) => {
  const web3Service = useContext(Web3ServiceContext)
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const [retryCount, setRetryCount] = useState(0)
  const [ignoreRecipients, setIgnoreRecipients] = useState<User[]>([])
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
    const existingExpiration = await web3Service.getKeyExpirationByLockForOwner(
      lockAddress,
      address,
      network
    )
    const isAddressWithKey = existingExpiration > new Date().getTime() / 1000
    const isAddressInList = recipientsList()
      .map(({ resolvedAddress }) => resolvedAddress)
      .includes(address)

    const valid = address?.length > 0 && !isAddressWithKey && !isAddressInList
    return {
      valid,
      address,
      isAddressWithKey,
      isAddressInList,
    }
  }

  const submitBulkRecipients = async () => {
    if (!network) return
    const url = `${config.services.storage.host}/v2/api/metadata/${network}/users`
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
          ToastHelper.error(`${result?.message}` ?? 'Failed to add metadata.')
        }

        if (errorCodes.includes(res.status)) {
          ToastHelper.error(result?.message ?? 'Ops, something went wrong')
          setRetryCount(retryCount + 1)
        }

        if (successCodes.includes(res.status)) {
          ToastHelper.success('Successfully added metadata')
          return true
        }
      }
      return false
    }
    ToastHelper.error('Failed to add metadata.')
    return false
  }

  const addRecipientItem = async <T>(
    userAddress: string,
    metadata: T
  ): Promise<boolean> => {
    setLoading(true)
    if (canAddUser()) {
      const index = recipients?.size + 1
      const { valid, address, isAddressWithKey, isAddressInList } =
        await getAddressAndValidation(userAddress)
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

      if (isAddressWithKey) {
        ToastHelper.error(
          'This address already owns a valid key. You cannot grant them a new one.'
        )
      } else if (isAddressInList) {
        ToastHelper.error(
          'This address can already present in list. Please add a new one'
        )
      } else if (!valid) {
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
    removeRecipient,
  }
}
