import {
  LoginModal as FundingModal,
  useFundWallet,
  usePrivy,
} from '@privy-io/react-auth'

import { Badge, Button, Input, Modal, Placeholder } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { base } from 'viem/chains'
import { SettingCard } from '../locks/Settings/elements/SettingCard'
import { useEthPrice } from '~/hooks/useEthPrice'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'

interface TransferForm {
  recipient: string
  amount: string
}

const BASE_NETWORK_ID = base.id

export const Funding = () => {
  const { account } = useAuthenticate()
  const { authenticated, sendTransaction, user } = usePrivy()
  const web3Service = useWeb3Service()
  const queryClient = useQueryClient()
  const { fundWallet } = useFundWallet({
    onUserExited: () => {
      ToastHelper.error('Funding operation cancelled')
    },
  })
  const [showFundingModal, setShowFundingModal] = useState(false)
  const isPrivyWallet = user?.wallet?.walletClientType === 'privy'
  const balanceQueryKey = ['getBalance', account, BASE_NETWORK_ID]

  const { isPending: isLoadingBalance, data: userBalance } = useQuery({
    queryKey: balanceQueryKey,
    queryFn: async () => {
      return parseFloat(
        await web3Service.getAddressBalance(account!, BASE_NETWORK_ID)
      )
    },
    enabled: !!account,
  })

  const { data: ethPrice } = useEthPrice({
    amount: userBalance?.toFixed(4),
    network: BASE_NETWORK_ID,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferForm>({
    mode: 'onChange',
    defaultValues: {
      recipient: '',
      amount: '',
    },
  })

  const handleFundWallet = async () => {
    if (!account) {
      ToastHelper.error('Connect your account before funding it.')
      return
    }

    setShowFundingModal(true)
    await fundWallet(account, {
      chain: base,
    })
  }

  const transferMutation = useMutation({
    mutationFn: async ({ recipient, amount }: TransferForm) => {
      if (!account || !authenticated || !isPrivyWallet) {
        throw new Error('Connect your Privy account before sending ETH.')
      }

      const recipientAddress = recipient.trim()
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Enter a valid Ethereum address.')
      }

      const amountNumber = parseFloat(amount)
      const amountInWei = ethers.parseEther(amount.trim())
      if (amountInWei <= BigInt(0)) {
        throw new Error('Enter an amount greater than 0.')
      }

      if (typeof userBalance === 'number' && amountNumber > userBalance) {
        throw new Error('Amount exceeds your current balance.')
      }

      return await sendTransaction({
        to: recipientAddress,
        value: `0x${amountInWei.toString(16)}`,
      })
    },
    onSuccess: () => {
      ToastHelper.success('ETH transfer submitted.')
      reset()
      queryClient.invalidateQueries({
        queryKey: balanceQueryKey,
      })
    },
    onError: (error) => {
      ToastHelper.error(
        error instanceof Error
          ? error.message
          : 'ETH transfer could not be submitted.'
      )
    },
  })

  const handleTransfer = (form: TransferForm) => {
    transferMutation.mutate(form)
  }

  const ethPriceNumber =
    typeof ethPrice === 'string' ? parseFloat(ethPrice) : ethPrice

  return (
    <SettingCard
      label="Fund Wallet"
      description="You can fund your account with ETH. This will enable you to purchase paid memberships or event tickets."
      defaultOpen={true}
    >
      <div className="space-y-5 mt-5">
        {isLoadingBalance ? (
          <Placeholder.Root>
            <Placeholder.Line size="md" />
          </Placeholder.Root>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-gray-700">Your current balance</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={userBalance === 0 ? 'red' : 'default'}
                  className="text-lg font-bold"
                >
                  {userBalance?.toFixed(4)} ETH
                </Badge>
                {userBalance !== 0 && ethPriceNumber && ethPriceNumber > 0 && (
                  <div className="text-gray-600">
                    (≈{' '}
                    <span className="font-semibold">
                      ${new Intl.NumberFormat().format(ethPriceNumber)}
                    </span>
                    )
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleFundWallet}>Fund Account</Button>

            {isPrivyWallet && (
              <form
                className="grid gap-3 pt-5 border-t border-gray-200"
                onSubmit={handleSubmit(handleTransfer)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-800">
                    Send ETH to an external wallet
                  </span>
                  <span className="text-sm text-gray-600">
                    Transfer ETH from this Privy account on Base.
                  </span>
                </div>
                <Input
                  label="Recipient address"
                  size="small"
                  placeholder="0x..."
                  disabled={transferMutation.isPending}
                  {...register('recipient', {
                    required: 'Recipient address is required.',
                    validate: (value) =>
                      ethers.isAddress(value.trim()) ||
                      'Enter a valid Ethereum address.',
                  })}
                  error={errors.recipient?.message}
                />
                <Input
                  label={`Amount to transfer${
                    typeof userBalance === 'number'
                      ? `, up to ${userBalance.toFixed(4)} ETH`
                      : ''
                  }`}
                  size="small"
                  type="number"
                  min={0}
                  step="any"
                  disabled={transferMutation.isPending}
                  {...register('amount', {
                    required: 'Amount is required.',
                    validate: (value) => {
                      let amountInWei = BigInt(0)
                      try {
                        amountInWei = ethers.parseEther(value.trim())
                      } catch (_error) {
                        return 'Enter a valid ETH amount.'
                      }

                      if (amountInWei <= BigInt(0)) {
                        return 'Amount should be greater than 0.'
                      }

                      if (
                        typeof userBalance === 'number' &&
                        parseFloat(value) > userBalance
                      ) {
                        return 'Amount exceeds your current balance.'
                      }

                      return true
                    },
                  })}
                  error={errors.amount?.message}
                />
                <Button
                  type="submit"
                  loading={transferMutation.isPending}
                  disabled={isLoadingBalance || transferMutation.isPending}
                >
                  {transferMutation.isPending ? 'Sending...' : 'Send ETH'}
                </Button>
              </form>
            )}

            <Modal
              isOpen={showFundingModal}
              setIsOpen={setShowFundingModal}
              size="small"
            >
              <FundingModal open={showFundingModal} />
            </Modal>
          </>
        )}
      </div>
    </SettingCard>
  )
}
