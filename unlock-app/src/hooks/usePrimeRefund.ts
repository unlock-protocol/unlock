import { useMutation, useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { useAuthenticate } from './useAuthenticate'
import { ethers } from 'ethers'
import { useProvider } from './useProvider'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'

const HOOK_ABI = [
  {
    inputs: [],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'refunds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

// This hook will return the status of the user's prime key
export const usePrimeRefund = () => {
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const web3Service = useWeb3Service()
  const primeRefund = useQuery({
    queryKey: ['usePrimeRefund', account],
    queryFn: async () => {
      if (!account) {
        return {
          amount: 0,
          timestamp: 0,
        }
      }
      const hookAddress = await web3Service.onKeyPurchaseHook({
        lockAddress: config.prime.contract,
        network: config.prime.network,
      })
      const hook = new ethers.Contract(
        hookAddress,
        HOOK_ABI,
        await web3Service.providerForNetwork(config.prime.network)
      )
      const amount = await hook.refunds(account, 0)
      const timestamp = await hook.refunds(account, 1)
      return {
        amount,
        timestamp,
      }
    },
    enabled: !!account,
  })

  const claimRefund = useMutation({
    mutationFn: async () => {
      const walletService = await getWalletService(config.prime.network)
      const hookAddress = await web3Service.onKeyPurchaseHook({
        lockAddress: config.prime.contract,
        network: config.prime.network,
      })
      const hook = new ethers.Contract(
        hookAddress,
        HOOK_ABI,
        walletService.signer
      )

      return ToastHelper.promise(
        hook
          .claimRefund()
          .then((tx: any) => tx.wait())
          .then(() => primeRefund.refetch()),
        {
          success: 'Your refund was processed!.',
          error: 'We could not process your refund. Please try again later.',
          loading: 'Sending transaction to claim your refund...',
        }
      )
    },
  })

  return { ...primeRefund, claimRefund }
}
