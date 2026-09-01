import {
  LoginModal as FundingModal,
  useFundWallet,
  usePrivy,
} from '@privy-io/react-auth'

import {
  AddressInput,
  Badge,
  Button,
  Input,
  Modal,
  Placeholder,
} from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useMutation, useQuery } from '@tanstack/react-query'
import { base } from 'viem/chains'
import { SettingCard } from '../locks/Settings/elements/SettingCard'
import { useEthPrice } from '~/hooks/useEthPrice'
import { useEmbeddedWallet } from '~/hooks/useEmbeddedWallet'
import { Controller, useForm } from 'react-hook-form'
import { ethers } from 'ethers'

interface TransferForm {
  recipient: string
  amount: number
}

export const Funding = () => {
  const { account } = useAuthenticate()
  const { sendTransaction } = usePrivy()
  const { isEmbeddedWallet } = useEmbeddedWallet()
  const web3Service = useWeb3Service()
  const { fundWallet } = useFundWallet({
    onUserExited: () => {
      ToastHelper.error('Funding operation cancelled')
    },
  })
  const [showFundingModal, setShowFundingModal] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferForm>({
    mode: 'onChange',
    defaultValues: {
      recipient: '',
      amount: 0,
    },
  })

  const {
    isPending: isLoadingBalance,
    data: userBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['getBalance', account, 8453],
    queryFn: async () => {
      return parseFloat(await web3Service.getAddressBalance(account!, 8453))
    },
  })

  const { data: ethPrice } = useEthPrice({
    amount: userBalance?.toFixed(4),
    network: 8453,
  })

  const handleFundWallet = async () => {
    setShowFundingModal(true)
    await fundWallet(account!, {
      chain: base,
    })
  }

  const transferEth = async ({ recipient, amount }: TransferForm) => {
    const value = ethers.parseEther(amount.toString())
    return await sendTransaction({
      to: recipient,
      value: `0x${value.toString(16)}`,
    })
  }

  const transferMutation = useMutation({
    mutationFn: transferEth,
    onSuccess: async (tx) => {
      reset()
      await refetchBalance()
      ToastHelper.success(
        tx?.hash
          ? `ETH transfer submitted: ${tx.hash}`
          : 'ETH transfer submitted'
      )
    },
    onError: (error: Error) => {
      ToastHelper.error(error.message || 'ETH transfer failed')
    },
  })

  const transferAmount = watch('amount')
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

            {isEmbeddedWallet && (
              <form
                className="grid max-w-md gap-4 border-t pt-5"
                onSubmit={handleSubmit((form) =>
                  transferMutation.mutateAsync(form)
                )}
              >
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-brand-dark">
                    Transfer ETH
                  </h3>
                  <p className="text-sm text-gray-600">
                    Send ETH from this Privy wallet to another wallet on Base.
                  </p>
                </div>

                <Controller
                  name="recipient"
                  control={control}
                  rules={{
                    required: 'Enter a recipient wallet address.',
                    validate: (value) =>
                      ethers.isAddress(value) ||
                      'Enter a valid wallet address.',
                  }}
                  render={({ field }) => (
                    <AddressInput
                      withIcon
                      value={field.value}
                      label="Recipient wallet"
                      onChange={(value: string) => {
                        setValue('recipient', value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }}
                    />
                  )}
                />
                {errors.recipient?.message && (
                  <span className="text-sm text-red-600">
                    {errors.recipient.message}
                  </span>
                )}

                <Input
                  label={`Amount to transfer${
                    transferAmount ? `: ${transferAmount} ETH` : ''
                  }`}
                  size="small"
                  type="number"
                  min={0}
                  max={userBalance}
                  step="any"
                  disabled={transferMutation.isPending}
                  {...register('amount', {
                    valueAsNumber: true,
                    validate: (value) => {
                      if (!value || value <= 0) {
                        return 'The transfer amount should be greater than 0.'
                      }

                      if (userBalance !== undefined && value > userBalance) {
                        return `The amount should be less than the current balance of ${userBalance.toFixed(
                          4
                        )} ETH.`
                      }

                      return true
                    },
                  })}
                  error={errors.amount?.message}
                />

                <Button
                  type="submit"
                  loading={transferMutation.isPending}
                  disabled={transferMutation.isPending}
                >
                  Transfer ETH
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
