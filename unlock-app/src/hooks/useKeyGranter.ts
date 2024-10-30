import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { minifyAddress } from '@unlock-protocol/ui'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useProvider } from './useProvider'

export const useKeyGranter = ({ network }: { network: number }) => {
  const getKeyGranter = async () => {
    const { data } = await locksmith.balance()
    return data[network].address
  }

  return useQuery({
    queryKey: ['getKeyGranter', network],
    queryFn: () => {
      return getKeyGranter()
    },
  })
}

export const useAddKeyGranter = (lockAddress: string, network: number) => {
  const { getWalletService } = useProvider()
  const queryClient = useQueryClient()

  const addKeyGranter = async (address: string) => {
    const keyGranterAddress = minifyAddress(address)
    const walletService = await getWalletService(network)

    const addKeyGranterPromise = walletService.addKeyGranter({
      lockAddress,
      keyGranter: address,
    })

    await ToastHelper.promise(addKeyGranterPromise, {
      loading: `Adding ${keyGranterAddress} as Key Granter.`,
      success: `${keyGranterAddress} added as Key Granter.`,
      error: ` Could not add ${keyGranterAddress} as Key Granter.`,
    })
  }

  return useMutation({
    mutationFn: addKeyGranter,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['fetchKeyGranters', lockAddress, network],
      }),
  })
}

export const useRemoveKeyGranter = (lockAddress: string, network: number) => {
  const { getWalletService } = useProvider()
  const queryClient = useQueryClient()

  const removeKeyGranter = async (keyGranter: string) => {
    const walletService = await getWalletService(network)
    const removeKeyGranterPromise = walletService.removeKeyGranter({
      lockAddress,
      keyGranter,
    })

    await ToastHelper.promise(removeKeyGranterPromise, {
      loading: `Removing the key granter role for ${minifyAddress(keyGranter)}`,
      success: `Key Granter role removed for ${minifyAddress(keyGranter)}.`,
      error: `Could not remove Key Granter role for ${minifyAddress(keyGranter)}`,
    })
  }

  return useMutation({
    mutationFn: removeKeyGranter,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['fetchKeyGranters', lockAddress, network],
      }),
  })
}

export default useKeyGranter
