import React, { ReactNode, useEffect, useState } from 'react'
import {
  AUTH_SESSION_KEY,
  IS_REFUSED_TO_SIGN_KEY,
  SessionAuth,
  login,
} from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLocalStorage } from '@rehooks/local-storage'
interface Props {
  children?: ReactNode
}

export const Auth = ({ children }: Props) => {
  const [auth] = useLocalStorage<SessionAuth>(AUTH_SESSION_KEY)
  const [isRefusedToSign, setIsRefusedToSign] = useLocalStorage(
    IS_REFUSED_TO_SIGN_KEY,
    false
  )
  const [createdRequest, setCreatedRequest] = useState(false)
  const { account, getWalletService } = useAuth()
  const useSIWE =
    !!account &&
    auth?.walletAddress !== account &&
    !isRefusedToSign &&
    !document.hidden &&
    !createdRequest

  useEffect(() => {
    const connect = async () => {
      if (!useSIWE) {
        return
      }
      try {
        setCreatedRequest(true)
        const walletService = await getWalletService()
        await login(walletService)
        setCreatedRequest(false)
      } catch (error) {
        setCreatedRequest(false)
        setIsRefusedToSign(true)
      }
    }
    connect()
  }, [useSIWE, account, setIsRefusedToSign, getWalletService])

  return <React.Fragment>{children}</React.Fragment>
}
