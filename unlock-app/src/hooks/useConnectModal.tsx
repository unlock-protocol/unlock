import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext, useState } from 'react'
import { getCurrentProvider } from '~/utils/session'

export type ConnectStatus = 'crypto' | 'unlock_account'

interface AuthResult {
  walletService: WalletService
  provider: any
}
const ConnectModalContext = createContext({
  openConnectModal: (_state?: ConnectStatus) => {},
  openConnectModalAsync: async (_state?: ConnectStatus) => {
    return {} as AuthResult
  },
  closeConnectModal: () => {},
  status: 'crypto' as ConnectStatus,
  open: false as boolean,
  send: (_detail: any) => {},
  connection: new EventTarget(),
})

const send = (detail: any) => {
  connection.dispatchEvent(
    new CustomEvent('connected', {
      detail,
    })
  )
}
interface Props {
  children: React.ReactNode
}

export const connection = new EventTarget()

export const ConnectModalProvider = (props: Props) => {
  const [status, setStatus] = useState<ConnectStatus>('crypto')
  const [open, setOpen] = useState(false)

  const openConnectModal = (_status?: ConnectStatus) => {
    const provider = getCurrentProvider()
    const newStatus =
      provider?.toLowerCase()?.trim() === 'unlock' ? 'unlock_account' : 'crypto'
    setStatus(_status ?? newStatus)
    setOpen(true)
  }

  const openConnectModalAsync = async (
    _status?: ConnectStatus
  ): Promise<AuthResult> => {
    openConnectModal(_status)
    return new Promise((resolve) => {
      connection.addEventListener('connected', (event: any) => {
        resolve(event.detail)
      })
    })
  }

  const closeConnectModal = () => {
    setOpen(false)
  }

  return (
    <ConnectModalContext.Provider
      value={{
        open,
        status,
        closeConnectModal,
        openConnectModal,
        openConnectModalAsync,
        send,
        connection,
      }}
    >
      {props.children}
    </ConnectModalContext.Provider>
  )
}

export const useConnectModal = () => {
  return useContext(ConnectModalContext)
}
