import { useEffect, useState } from 'react'
import WalletConnectClient from '@walletconnect/client'

interface PeerMeta {
  description?: string
  url?: string
  name?: string
  icons?: string[]
}

const useWalletConnectClient = (account: string, chainId: number) => {
  const [client, setClient] = useState<WalletConnectClient>()
  const [peerMeta, setPeerMeta] = useState<PeerMeta>()
  const [connected, setConnected] = useState<boolean>(false)

  useEffect(() => {
    setClient(undefined)
  }, [account])

  const accept = () => {
    if (client) {
      console.log('READY TO APPROVE!')
      client.approveSession({
        accounts: [account],
        chainId,
      })
    }
    // else error>
  }

  const connect = (uri: string) => {
    window.localStorage.removeItem('walletconnect')
    const walletConnect = new WalletConnectClient({ uri })
    console.log(walletConnect)

    walletConnect.on('session_request', (error, payload) => {
      console.log('session_request', { payload })
      setPeerMeta(payload.params[0].peerMeta)
    })

    walletConnect.on('connect', () => {
      console.log('walletConnect > connect')
      setConnected(true)
    })

    walletConnect.on('error', (error) => {
      console.log('walletConnect> error', error)
    })

    walletConnect.on('call_request', (error, payload) => {
      console.log('call_request', { payload })
      const { id, method, params } = payload
      console.log({ id, method, params })
      // if (method === '') {
      // }
      // console.log(walletConnect)
      // if (payload.method === 'wallet_switchEthereumChain') {
      //   console.log('good!')

      //   return walletConnect.approveRequest({
      //     id: payload.id,
      //     jsonrpc: '2.0',
      //     result: null,
      //   })
      // }
      // console.log(payload)
      // {
      //   "id":1,
      //   "jsonrpc": "2.0",
      //   "result": "0x0234c8a3397aab58" // 158972490234375000
      // }
    })

    walletConnect.on('disconnect', async () => {
      console.log('walletConnect > disconnect')
      setConnected(false)
    })
    setClient(walletConnect)
  }

  return { connect, peerMeta, accept, connected }
}

export default useWalletConnectClient
