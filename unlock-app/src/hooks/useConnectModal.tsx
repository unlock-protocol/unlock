import { createContext, useContext, useState } from 'react'
import { useAuthenticate } from './useAuthenticate'

const ConnectModalContext = createContext({
  openConnectModal: () => {},
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
  const { signInWithPrivy } = useAuthenticate()

  const openConnectModal = async () => {
    const needsToOpen = await signInWithPrivy()
    setOpen(needsToOpen)
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
