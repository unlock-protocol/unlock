import { ReactNode, createContext, useContext, useState } from 'react'
import { useLegacyAuth } from '~/contexts/LegacyAuthenticationContext'
import { SiweMessage } from 'siwe'
import { locksmith } from '~/config/locksmith'
import { useQueryClient } from '@tanstack/react-query'
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from '~/utils/session'
import { config } from '~/config/app'
import ProviderContext from '~/contexts/ProviderContext'
import { isInIframe } from '~/utils/iframe'
import { signOut as nextSignOut } from 'next-auth/react'
import { useSession } from '../useSession'

export type Status = 'loading' | 'error' | 'success' | 'rejected' | 'idle'

export interface LegacySIWEContextType {
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
  signature?: string
  message?: string
}

const signOutToken = async () => {
  const session = getAccessToken()
  if (session) {
    // First, revoke the session on the server with the token
    await locksmith.revoke().catch(console.error)
    // Then remove token locally
    return removeAccessToken()
  }
}

const LegacySIWEContext = createContext<LegacySIWEContextType>({
  siweSign: (_nonce: string, _statement: string) => {
    throw new Error('No SIWE provider found')
  },
  signIn: () => {
    throw new Error('No SIWE provider found')
  },
  signature: undefined,
  message: undefined,
  signOut: signOutToken,
  session: undefined,
  isSignedIn: false,
})

interface Props {
  children: ReactNode
}

export const SIWEProvider = ({ children }: Props) => {
  const [siweResult, setSiweResult] = useState<{
    message: string
    signature: string
  } | null>(null)
  const { connected, getWalletService, network } = useLegacyAuth()
  const { provider } = useContext(ProviderContext)
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
      // Before signing out, we need to revoke the token
      await nextSignOut({ redirect: false })
      await signOutToken()
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
      const walletService = await getWalletService()
      const address = await walletService.signer.getAddress()

      const parent = new URL(
        isInIframe() ? config.unlockApp : window.location.href
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

      let domain = window.location.host
      // If we are using the parent's provider, then we MUST use the parent's domain
      if (provider?.parentOrigin) {
        domain = new URL(provider.parentOrigin()).host
      }

      const siwe = new SiweMessage({
        domain,
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
    setStatus('loading')
    try {
      if (!connected) {
        throw new Error('No wallet connected.')
      }

      const { data: nonce } = await locksmith.nonce()
      const siweResult = await siweSign(nonce, '')

      if (siweResult) {
        setSiweResult(siweResult)
        const { message, signature } = siweResult
        const response = await locksmith.login({
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
    } catch (error) {
      console.error(error)
      onError(error)
      return null
    }
    setStatus('idle')
  }

  const isSignedIn = !!session

  return (
    <LegacySIWEContext.Provider
      value={{
        session,
        signIn,
        siweSign,
        signOut,
        status,
        isSignedIn,
        signature: siweResult?.signature,
        message: siweResult?.message,
      }}
    >
      {children}
    </LegacySIWEContext.Provider>
  )
}

export const useLegacySIWE = () => {
  return useContext(LegacySIWEContext)
}
