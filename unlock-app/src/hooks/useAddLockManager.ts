import { useMutation } from '@tanstack/react-query'
import { minifyAddress } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useProvider } from './useProvider'

export const useAddLockManager = (lockAddress: string, network: number) => {
  const { getWalletService } = useProvider()

  const addLockManager = async (address: string) => {
    const managerAddress = minifyAddress(address)
    const walletService = await getWalletService(network)
    const addManagerPromise = walletService.addLockManager({
      lockAddress,
      userAddress: address,
    })
    await ToastHelper.promise(addManagerPromise, {
      loading: `Adding ${managerAddress} as Lock Manager.`,
      success: `${managerAddress} added as Lock Manager.`,
      error: ` Impossible to add ${managerAddress} as Lock Manager, please try again.`,
    })
  }

  return useMutation({
    mutationFn: addLockManager,
  })
}
