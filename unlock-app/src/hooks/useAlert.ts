import { useState } from 'react'

interface openAlertInterface {
  title?: string
  body: string
}

/**
 * Hook to open alert messages
 * @returns
 */
export const useAlert = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [title, setTitle] = useState('Title of the Alert')
  const [text, setText] = useState('Body of the Alert')

  const openAlert = ({ title, body }: openAlertInterface) => {
    if (title) {
      setTitle(title)
    }
    setText(body)
    setIsOpen(true)
  }

  const alertProps = {
    isOpen,
    setIsOpen,
    text,
    title,
  }

  return { openAlert, alertProps }
}

export default useAlert
