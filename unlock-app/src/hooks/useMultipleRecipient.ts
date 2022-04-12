import { useState, useEffect } from 'react'
import { ToastHelper } from '../components/helpers/toast.helper'
import { getAddressForName } from './useEns'

export interface RecipientItem {
  userAddress: string
  valid: boolean
  data?: any[]
  keyId?: string
}

export const useMultipleRecipient = (maxRecipients: number = 1) => {
  const [hasMultipleRecipients, setHasMultipleRecipients] = useState(false)
  const [recipients, setRecipients] = useState(new Set<RecipientItem>())
  const [addNew, setAddNew] = useState(false)
  const [isGroupValid, setIsGroupValid] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setHasMultipleRecipients(maxRecipients > 1)
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

  const addUser = (userAddress: string, metadata?: any) => {
    if (canAddUser()) {
      setRecipients(
        (prev) =>
          new Set(
            prev.add({
              userAddress,
              data: metadata,
              valid: false,
            })
          )
      )
    } else {
      ToastHelper.error("You can't add morerecipients")
    }
  }

  return {
    hasMultipleRecipients,
    recipients: recipientsList,
    addUser,
    setAddNew,
    addNew,
    isGroupValid,
    loading,
  }
}
