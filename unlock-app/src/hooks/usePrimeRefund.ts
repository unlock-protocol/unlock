import { useMutation, useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { config } from '~/config/app'
import { useAuthenticate } from './useAuthenticate'
import { ethers } from 'ethers'
import { useProvider } from './useProvider'
import { ToastHelper } from '~/components/helpers/toast.helper'

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

  const primeRefund = useQuery({
    queryKey: ['usePrimeRefund', account],
    queryFn: async () => {
      if (!account) {
        return {
          amount: 0,
          timestamp: 0,
        }
      }
      const web3Service = new Web3Service(networks)
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
      const web3Service = new Web3Service(networks)
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
