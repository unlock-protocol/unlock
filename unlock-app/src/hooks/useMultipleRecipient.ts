import { useState, useEffect } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { getAddressForName } from './useEns'

export interface RecipientItem {
  userAddress: string
  valid: boolean
  index: number
  data?: { [key: string]: any }
  keyId?: string
}

export const useMultipleRecipient = (maxRecipients = 1) => {
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [isGroupValid, setIsGroupValid] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const submit = async () => {
    await validate()
    // todo: submit data
  }

  const addRecipientItem = async (
    userAddress: string,
    metadata?: any
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
                userAddress: userAddress ?? '',
                data: metadata ?? {},
                index,
                valid,
              })
            )
        )
      }
      if (!valid) {
        ToastHelper.error('Recipient address is not valid, please check it')
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
  }
}
