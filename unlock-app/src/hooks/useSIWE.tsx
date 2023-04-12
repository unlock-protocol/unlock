import { ReactNode, createContext, useContext, useState } from 'react'
import { useSession } from './useSession'
import { useAuth } from '~/contexts/AuthenticationContext'
import { SiweMessage } from 'siwe'
import { storage } from '~/config/storage'
import { useQueryClient } from '@tanstack/react-query'
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from '~/utils/session'

type Status = 'loading' | 'error' | 'success' | 'rejected' | 'idle'

export interface SIWEContextType {
  session?: string | null
  signIn: () => Promise<unknown> | unknown
  signOut: () => Promise<unknown> | unknown
  status?: Status
  isSignedIn: boolean
}

const SIWEContext = createContext<SIWEContextType>({
  signIn: () => {
    throw new Error('No SIWE provider found')
  },
  signOut: () => {
    throw new Error('No SIWE provider found')
  },
  session: undefined,
  isSignedIn: false,
})

interface Props {
  children: ReactNode
}

export const SIWEProvider = ({ children }: Props) => {
  const { connected, getWalletService, network } = useAuth()
  const { session, refetchSession } = useSession()
  const [status, setStatus] = useState<Status>('idle')
  const queryClient = useQueryClient()

  const onError = (error: any) => {
    console.error(error)
    switch (error.code) {
      case -32000:
      case 4001:
      case 'ACTION_REJECTED':
        setStatus('rejected')
        break
      default:
        setStatus('error')
    }
  }

  const signOut = async () => {
    try {
      setStatus('loading')
      const session = getAccessToken()
      if (session) {
        await storage.revoke().catch(console.error)
        removeAccessToken()
      }
      await Promise.all([queryClient.invalidateQueries(), refetchSession()])
      setStatus('idle')
    } catch (error) {
      onError(error)
    }
  }

  const signIn = async () => {
    try {
      setStatus('loading')
      if (!connected) {
        throw new Error('No wallet connected.')
      }
      const walletService = await getWalletService()

      const address = await walletService.signer.getAddress()
      const { data: nonce } = await storage.nonce()
      const parent = new URL(
        window.location != window.parent.location
          ? document.referrer
          : document.location.href
      )
      const resources = []
      if (parent.host !== window.location.hostname) {
        resources.push(window.location.origin)
      }
      const siwe = new SiweMessage({
        domain: parent.host,
        uri: parent.origin,
        address,
        chainId: network,
        version: '1',
        statement: '',
        nonce,
        resources,
      })

      const message = siwe.prepareMessage()
      const signature = await walletService.signMessage(
        message,
        'personal_sign'
      )
      const response = await storage.login({
        message,
        signature,
      })
      const { accessToken, walletAddress } = response.data
      if (accessToken && walletAddress) {
        saveAccessToken({
          accessToken,
          walletAddress,
        })
      }
      await queryClient.refetchQueries()
      await refetchSession()
      setStatus('idle')
    } catch (error) {
      onError(error)
    }
  }
  const isSignedIn = !!session
  return (
    <SIWEContext.Provider
      value={{ session, signIn, status, signOut, isSignedIn }}
    >
      {children}
    </SIWEContext.Provider>
  )
}

export const useSIWE = () => {
  return useContext(SIWEContext)
}
