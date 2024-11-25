import { LoginModal as PrivyTransactionPrompt } from '@privy-io/react-auth'
import { useEffect } from 'react'

interface PrivyTransactionPromptWrapperProps {
  transactionFunction: () => Promise<void>
  transaction?: any
}

export function PrivyTransactionPromptWrapper({
  transactionFunction,
}: PrivyTransactionPromptWrapperProps) {
  useEffect(() => {
    transactionFunction()
  }, [])

  return <PrivyTransactionPrompt open={true} />
}
