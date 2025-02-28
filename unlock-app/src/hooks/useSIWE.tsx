import { ReactNode, createContext, useContext, useState } from 'react'
import { SiweMessage } from 'siwe'
import { config } from '~/config/app'
import { isInIframe } from '~/utils/iframe'
import { useProvider } from './useProvider'

export type Status = 'loading' | 'error' | 'success' | 'rejected' | 'idle'

export interface SIWEContextType {
  siweSign: (
    nonce: string,
    statement: string,
    opts?: any
  ) => Promise<{ message: string; signature: string } | null> | null
  status?: Status
  signature?: string
  message?: string
}

const SIWEContext = createContext<SIWEContextType>({
  siweSign: (_nonce: string, _statement: string) => {
    throw new Error('No SIWE provider found')
  },
  signature: undefined,
  message: undefined,
})

interface Props {
  children: ReactNode
}

export const SIWEProvider = ({ children }: Props) => {
  const [siweResult, setSiweResult] = useState<{
    message: string
    signature: string
  } | null>(null)
  const { getWalletService, provider } = useProvider()
  const [status, setStatus] = useState<Status>('idle')

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

      const { chainId: network } =
        await walletService.signer.provider.getNetwork()

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
      setSiweResult({ message, signature })
      return { message, signature }
    } catch (error) {
      console.error(error)
      onError(error)
      return null
    }
  }

  return (
    <SIWEContext.Provider
      value={{
        siweSign,
        status,
        signature: siweResult?.signature,
        message: siweResult?.message,
      }}
    >
      {children}
    </SIWEContext.Provider>
  )
}

export const useSIWE = () => {
  return useContext(SIWEContext)
}
