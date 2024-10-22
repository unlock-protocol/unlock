import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext, useState } from 'react'

interface AuthResult {
  walletService: WalletService
  provider: any
}
const ConnectModalContext = createContext({
  openConnectModal: () => {},
  openConnectModalAsync: async () => {
    return {} as AuthResult
  },
  closeConnectModal: () => {},
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
  const [open, setOpen] = useState(false)

  const openConnectModal = () => {
    setOpen(true)
  }

  const openConnectModalAsync = async (): Promise<AuthResult> => {
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
