import { MouseEventHandler } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'

interface CProps {
  isOnRequiredNetwork: boolean
  onNetworkChangeHandler: MouseEventHandler
}

interface Props {
  requiredNetwork: number
  children: (props: CProps) => JSX.Element
}

export const SwitchNetwork = ({ requiredNetwork, children }: Props) => {
  const { network: currentNetwork, changeNetwork } = useAuth()
  const isOnRequiredNetwork = currentNetwork === requiredNetwork
  return children({
    isOnRequiredNetwork,
    onNetworkChangeHandler: (event) => {
      event.preventDefault()
      changeNetwork(requiredNetwork)
    },
  })
}
