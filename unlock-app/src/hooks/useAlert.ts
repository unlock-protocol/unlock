import { useState } from 'react'

interface OpenAlertInterface {
  title?: string
  body: string
}

/**
 * Hook to open alert messages
 * @returns
 */
export const useAlert = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  const openAlert = ({ title, body }: OpenAlertInterface) => {
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
