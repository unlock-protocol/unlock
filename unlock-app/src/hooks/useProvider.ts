import React from 'react'
import { useDispatch } from 'react-redux'
import { providerReady } from '../actions/provider'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'
import { FATAL_NOT_ENABLED_IN_PROVIDER } from '../errors'
import { setError } from '../actions/error'

import { Application } from '../utils/Error'

import { ConfigContext } from '../utils/withConfig'

export const Web3ProviderContext = React.createContext({
  getWeb3Provider: () => {},
  setWeb3Provider: () => {},
})

export interface EthereumWindow extends Window {
  web3: any
  ethereum: any
}
interface Web3ProviderContextType {
  getWeb3Provider: any
  setWeb3Provider: any
}

interface Config {
  env: string
  httpProvider: string
}

export const useProvider = () => {
  const config: Config = React.useContext(ConfigContext)
  const { getWeb3Provider, setWeb3Provider } = React.useContext<
    Web3ProviderContextType
  >(Web3ProviderContext)

  const dispatch = useDispatch()

  const [loading, setLoading] = React.useState(true)

  /**
   * Function which is called when the App component is rendered.
   */
  const initializeProvider = async () => {
    if (config.env === 'test') {
      // We set the provider to be the provided by the local ganache
      setWeb3Provider(`http://${config.httpProvider}:8545`)
      dispatch(providerReady())
      setLoading(false)
      return
    }

    const ethereumWindow = (window as unknown) as EthereumWindow

    // If there is an injected provider
    if (ethereumWindow.ethereum) {
      dispatch(waitForWallet())
      try {
        // Request account access if needed
        await ethereumWindow.ethereum.enable()
        setWeb3Provider(ethereumWindow.ethereum)
        dispatch(providerReady())
      } catch (error) {
        dispatch(setError(Application.Fatal(FATAL_NOT_ENABLED_IN_PROVIDER)))
      }
      dispatch(dismissWalletCheck())
    } else if (ethereumWindow.web3) {
      // Legacy web3 wallet/browser (should we keep supporting?)
      setWeb3Provider(ethereumWindow.web3.currentProvider)
      dispatch(providerReady())
    } else {
      // Hum. No provider!
      // TODO: Let's let the user pick one up from the UI (including the unlock provider!)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    const provider = getWeb3Provider()
    if (provider) {
      // The context already has a provider, we're ready to work
      setLoading(false)
    } else {
      // Try to initalize the provider if there isn't one already
      initializeProvider()
    }
  }, [])

  return { provider: getWeb3Provider(), loading }
}
