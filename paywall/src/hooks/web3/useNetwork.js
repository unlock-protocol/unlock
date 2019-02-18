import { useState, useEffect } from 'react'
import useWallet from './useWallet'
import usePoll from '../utils/usePoll'
import { POLLING_INTERVAL } from '../../constants'
import useConfig from '../utils/useConfig'
import getNetworkId from '../asyncActions/network'

export default function useNetwork({ noPoll = false } = {}) {
  const wallet = useWallet()
  const { requiredNetworkId } = useConfig()
  const [currentNetwork, setCurrentNetwork] = useState(requiredNetworkId)

  usePoll(
    () => {
      if (noPoll || !wallet) return
      getNetworkId(networkId => {
        if (networkId !== currentNetwork) setCurrentNetwork(networkId)
      }, wallet)
    },
    POLLING_INTERVAL,
    [wallet, noPoll]
  )
  useEffect(
    () => {
      if (!noPoll || !wallet) return
      getNetworkId(networkId => setCurrentNetwork(networkId), wallet)
    },
    [wallet, noPoll]
  ) // runs any time wallet changes
  return currentNetwork
}
