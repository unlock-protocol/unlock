import { useSelector } from 'react-redux'
import UnlockProvider from '../services/unlockProvider'

type Provider = UnlockProvider | null
interface State {
  provider: Provider
}

export const useProvider = () => {
  const provider = useSelector<State, Provider>(state => state.provider)

  return { provider }
}
