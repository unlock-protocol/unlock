import { useState, useEffect, useContext } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { ConfigContext } from '../utils/withConfig'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { getAddressForName } from './useEns'
import { Lock, PaywallConfig } from '../unlockTypes'
import { formResultToMetadata } from '../utils/userMetadata'

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
  lock: Lock,
  paywallConfig?: PaywallConfig
) => {
  let maxRecipients = 1
  if (paywallConfig?.maxRecipients) {
    maxRecipients = paywallConfig.maxRecipients
  } else if (lock?.address && paywallConfig?.locks[lock.address]) {
    maxRecipients = paywallConfig?.locks[lock.address].maxRecipients || 1
  }

  let minRecipients = 1
  if (paywallConfig?.minRecipients) {
    minRecipients = paywallConfig.minRecipients
  } else if (lock?.address && paywallConfig?.locks[lock.address]) {
    minRecipients = paywallConfig?.locks[lock.address].minRecipients || 1
  }

  let metadataInputs: Array<any> = []
  if (paywallConfig?.metadataInputs) {
    metadataInputs = paywallConfig.metadataInputs
  } else if (lock?.address && paywallConfig?.locks[lock.address]) {
    metadataInputs = paywallConfig?.locks[lock.address].metadataInputs || []
  }

  const web3Service = useContext(Web3ServiceContext)
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Map<number, RecipientItem>())
  const [loading, setLoading] = useState(false)
  const config: any = useContext(ConfigContext)
  const [retryCount, setRetryCount] = useState(0)
  const [ignoreRecipients, setIgnoreRecipients] = useState<User[]>([])
  const normalizeRecipients = () => {
    if (!lock.address) return

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
        const formattedMetadata = formResultToMetadata(metadata, metadataInputs)
        return {
          userAddress: resolvedAddress,
          metadata: {
            public: formattedMetadata.publicData,
            protected: formattedMetadata.protectedData,
          },
          lockAddress: lock.address,
        }
      }),
    }
    return payload
  }

  const clear = () => {
    setRecipients(new Map([]))
  }

  useEffect(() => {
    if (!maxRecipients || !minRecipients) return
    const activeMultiple = +maxRecipients > 1 || +minRecipients > 1
    setHasMultipleRecipients(activeMultiple)
  }, [])

  const recipientsList = (): RecipientItem[] => {
    return Array.from(recipients.values())
  }

  const canAddUser = () => {
    if (!maxRecipients) return
    return recipients.size < maxRecipients
  }

  const getAddressAndValidation = async (recipient: string) => {
    let address = ''
    let isAddressWithKey = false
    try {
      address = await getAddressForName(recipient)
      isAddressWithKey = await web3Service.getHasValidKey(
        lock.address,
        address,
        lock.network
      )
    } catch (err: any) {
      console.error(err?.message)
    }

    // todo: need also to check how many keys the address owns to improve this logic
    const limitNotReached = !isAddressWithKey
    const addressValid = address?.length > 0

    const valid = addressValid && limitNotReached
    return {
      valid,
      address,
      isAddressWithKey,
      limitNotReached,
    }
  }

  const submitBulkRecipients = async () => {
    if (!lock) return
    const url = `${config.services.storage.host}/v2/api/metadata/${lock.network}/users`
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

  const addRecipientItem = async <T extends Record<string, any>>(
    userAddress: string,
    metadata: T,
    updateIndex?: number
  ): Promise<boolean> => {
    setLoading(true)
    if (canAddUser()) {
      const index = updateIndex || recipients?.size + 1
      const { valid, address, isAddressWithKey, limitNotReached } =
        await getAddressAndValidation(userAddress)
      if (valid) {
        try {
          setRecipients((prev) =>
            prev.set(index, {
              userAddress,
              metadata,
              index,
              resolvedAddress: address ?? userAddress,
              valid,
            })
          )
          ToastHelper.success('Recipient correctly added in list.')
        } catch (err) {
          console.error(err)
          ToastHelper.error('Error by adding recipient in list')
        }
      }

      if (!limitNotReached && isAddressWithKey) {
        ToastHelper.error(
          'This address reached max keys limit. You cannot grant them a new one.'
        )
      } else if (isAddressWithKey) {
        ToastHelper.error(
          'This address already owns a valid key. You cannot grant them a new one.'
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

  const removeRecipient = (index: number) => {
    recipients.delete(index)
    setRecipients(new Map(recipients))
  }

  const hasMinimumRecipients = recipientsList().length >= (minRecipients || 1)

  return {
    hasMultipleRecipients,
    recipients: recipientsList(),
    addRecipientItem,
    loading,
    maxRecipients: maxRecipients || 1,
    minRecipients: minRecipients || 1,
    submitBulkRecipients: submit,
    clear,
    removeRecipient,
    hasMinimumRecipients,
  }
}
