import { useSelector } from 'react-redux'
import { useContext } from 'react'
import UnlockProvider from '../services/unlockProvider'
import { ConfigContext } from '../utils/withConfig'

type Provider = UnlockProvider | null

interface State {
  provider: string
}

interface Config {
  providers: {
    [name: string]: Provider
  }
}

export const useProvider = () => {
  const config: Config = useContext(ConfigContext)
  const providerName = useSelector<State, string>(state => state.provider)
  const provider = config.providers[providerName]

  return { provider }
}
