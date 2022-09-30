import { useMutation } from 'react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConfig } from '~/utils/withConfig'

export const useNetwork = () => {
  const { networks } = useConfig()
  const { network: connectedNetwork, changeNetwork } = useAuth()

  const onChangeNetwork = async ({ network }: any) => {
    return await changeNetwork(networks[network])
  }

  const changeNetworkMutation = useMutation(onChangeNetwork)
  const switchToNetworkBeforeAction = async (
    network: number,
    callback: () => void
  ) => {
    const differentNetwork = network != connectedNetwork
    if (differentNetwork) {
      await changeNetworkMutation.mutate({
        network,
      })
      await callback()
    } else {
      await callback()
    }
  }

  return {
    switchToNetworkBeforeAction,
  }
}
