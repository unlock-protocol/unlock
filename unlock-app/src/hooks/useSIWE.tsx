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
  siweSign: (
    nonce: string,
    statement: string,
    opts?: any
  ) => Promise<{ message: string; signature: string } | null> | null
  signOut: () => Promise<unknown> | unknown
  status?: Status
  isSignedIn: boolean
}

const SIWEContext = createContext<SIWEContextType>({
  siweSign: (_nonce: string, _statement: string) => {
    throw new Error('No SIWE provider found')
  },
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

  const siweSign = async (
    nonce: string,
    statement: string,
    opts: {
      resources?: string[]
    } = {}
  ): Promise<{ message: string; signature: string } | null> => {
    try {
      if (!connected) {
        throw new Error('No wallet connected.')
      }
      const walletService = await getWalletService()

      const address = await walletService.signer.getAddress()
      const insideIframe = window.location !== window.parent.location

      const parent = new URL(
        insideIframe ? window.parent.location.href : window.location.href
      )

      // We can't have an empty resources array... because the siwe library does not parse that correctly
      // resulting in a different signature on the backend
      let resources =
        opts?.resources?.length && opts.resources?.length > 0
          ? opts.resources
          : undefined

      if (parent.host !== window.location.host) {
        resources = [window.location.origin]
      }

      const siwe = new SiweMessage({
        domain: window.location.host, // parent.host,
        uri: parent.origin,
        address,
        chainId: network,
        version: '1',
        statement,
        nonce,
        resources,
      })

      const message = siwe.prepareMessage()
      const signature = await walletService.signMessage(
        message,
        'personal_sign'
      )

      return { message, signature }
    } catch (error) {
      onError(error)
      return null
    }
  }

  const signIn = async () => {
    try {
      setStatus('loading')
      if (!connected) {
        throw new Error('No wallet connected.')
      }

      const { data: nonce } = await storage.nonce()
      const siweResult = await siweSign(nonce, '')
      if (siweResult) {
        const { message, signature } = siweResult
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
      }
      setStatus('idle')
    } catch (error) {
      onError(error)
      return null
    }
  }

  const isSignedIn = !!session
  return (
    <SIWEContext.Provider
      value={{ session, signIn, siweSign, status, signOut, isSignedIn }}
    >
      {children}
    </SIWEContext.Provider>
  )
}

export const useSIWE = () => {
  return useContext(SIWEContext)
}
