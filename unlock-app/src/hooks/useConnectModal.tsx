import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthenticate } from './useAuthenticate'
import { useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()

  const privy_oauth_state = searchParams.get('privy_oauth_state')

  useEffect(() => {
    if (privy_oauth_state) {
      signInWithPrivy({
        onshowUI: () => {
          setOpen(true)
        },
      })
    }
  }, [privy_oauth_state])

  const openConnectModal = async () => {
    signInWithPrivy({
      onshowUI: () => {
        setOpen(true)
      },
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
