import React, { useState, useEffect } from 'react'
import { getAddressForName } from './useEns'

export const useAdvancedCheckout = () => {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [recipient, setRecipient] = useState<string>('')
  const [recipientValid, setRecipientValid] = useState(false)
  const [checkingRecipient, setCheckingRecipient] = useState(false)

  const advancedRecipientValid = isAdvanced
    ? recipient?.length > 0 && recipientValid
    : true

  const onRecipientChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setRecipientValid(false)
    setRecipient(value)
    setCheckingRecipient(true)
    const address = await getAddressForName(value)
    setCheckingRecipient(false)
    if (address) {
      setRecipient(address)
      setRecipientValid(true)
    }
  }

  useEffect(() => {
    if (isAdvanced) return
    setRecipientValid(true)
    setRecipient('')
  }, [isAdvanced])

  return {
    isAdvanced,
    setIsAdvanced,
    advancedRecipientValid,
    onRecipientChange,
    recipient,
    checkingRecipient,
  }
}
