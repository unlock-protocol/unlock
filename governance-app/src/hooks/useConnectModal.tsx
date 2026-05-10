// ABOUTME: Context and hook for controlling the Privy connect modal visibility.
// Simplified version without locksmith dependencies — just wraps Privy login().
'use client'

import { createContext, useContext, useState } from 'react'
import { useLogin, usePrivy } from '@privy-io/react-auth'

interface ConnectModalContextValue {
  open: boolean
  openConnectModal: () => void
  closeConnectModal: () => void
}

const ConnectModalContext = createContext<ConnectModalContextValue>({
  open: false,
  openConnectModal: () => {},
  closeConnectModal: () => {},
})

export function ConnectModalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { ready } = usePrivy()
  const { login } = useLogin({
    onComplete: () => setOpen(false),
    onError: () => setOpen(false),
  })

  function openConnectModal() {
    if (!ready) return
    setOpen(true)
    login()
  }

  function closeConnectModal() {
    setOpen(false)
  }

  return (
    <ConnectModalContext.Provider
      value={{ open, openConnectModal, closeConnectModal }}
    >
      {children}
    </ConnectModalContext.Provider>
  )
}

export function useConnectModal() {
  return useContext(ConnectModalContext)
}
