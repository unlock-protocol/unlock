import { useEffect, useState } from 'react'
import WalletConnectClient from '@walletconnect/client'
import { useAuth } from '~/contexts/AuthenticationContext'

interface DappDetails {
  description?: string
  url?: string
  name?: string
  icons?: string[]
}

const useWalletConnectClient = () => {
  const { account, network: chainId, providerSend } = useAuth()
  const [client, setClient] = useState<WalletConnectClient>()
  const [dapp, setDapp] = useState<DappDetails>()
  const [connected, setConnected] = useState<boolean>(false)

  useEffect(() => {
    setClient(undefined)
  }, [account])

  const accept = () => {
    if (client && account && chainId) {
      client.approveSession({
        accounts: [account],
        chainId,
      })
    }
  }

  const connect = (uri: string) => {
    window.localStorage.removeItem('walletconnect')
    const walletConnect = new WalletConnectClient({ uri })
    walletConnect.on('session_request', (error, payload) => {
      if (error) {
        // Handle Error
        console.log('was there an error?')
      }
      setDapp(payload.params[0].peerMeta)
    })

    walletConnect.on('connect', () => {
      setConnected(true)
    })

    walletConnect.on('call_request', async (error, payload) => {
      if (error) {
        console.error(error)
        return
      }
      const { id, method, params } = payload
      if (method === 'personal_sign') {
        const result = await providerSend('personal_sign', params)
        walletConnect.approveRequest({
          id,
          result,
        })
      }
      if (payload.method === 'wallet_switchEthereumChain') {
        return walletConnect.approveRequest({
          id: payload.id,
          jsonrpc: '2.0',
          result: null,
        })
      }
      // Ignore other types
    })

    walletConnect.on('disconnect', async () => {
      setConnected(false)
    })
    setClient(walletConnect)
  }

  return { connect, dapp, accept, connected }
}

export default useWalletConnectClient
