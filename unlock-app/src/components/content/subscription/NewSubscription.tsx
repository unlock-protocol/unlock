'use client'

import { useCallback, useState } from 'react'
import { ONE_DAY_IN_SECONDS, UNLIMITED_KEYS_COUNT } from '~/constants'
import networks from '@unlock-protocol/networks'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useMutation } from '@tanstack/react-query'
import { CreateLockForm } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { CreateLockFormSummary } from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { useRouter } from 'next/navigation'
import { useProvider } from '~/hooks/useProvider'

export const Deploy: React.FC = () => {
  const { getWalletService } = useProvider()
  const [formData, setFormData] = useState<any>(undefined)
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  )
  const [lockAddress, setLockAddress] = useState<string | undefined>(undefined)

  const deployLock = useCallback(
    async (values: {
      network: number
      expirationDuration: number
      name: string
      unlimitedDuration: boolean
      currencyContractAddress: string
      keyPrice: string
    }) => {
      setFormData(values)
      const walletService = await getWalletService(values.network)
      const expirationInSeconds = Math.ceil(
        (values.expirationDuration as number) * ONE_DAY_IN_SECONDS
      )

      const lockAddress = await walletService.createLock(
        {
          name: values.name,
          expirationDuration: expirationInSeconds,
          maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
          currencyContractAddress: values.currencyContractAddress,
          keyPrice: values.keyPrice?.toString(),
          publicLockVersion: networks[values.network].publicLockVersionToDeploy,
        },
        {},
        (error: any, transactionHash: string | null) => {
          if (transactionHash) {
            setTransactionHash(transactionHash)
          }
          if (error) {
            console.error(error)
            ToastHelper.error(
              'Unexpected issue on lock creation, please try again'
            )
          } else {
            ToastHelper.success('Transaction sent, waiting for confirmation...')
          }
        }
      )
      setLockAddress(lockAddress)
      // ok great, we now have a lock Address! Let's update the metadata!
      // onLockDeployed({ lockAddress, network: values.network })
    },
    [getWalletService]
  )

  const onSubmitMutation = useMutation({
    mutationFn: deployLock,
  })

  const router = useRouter()

  const onBack = () => {
    router?.back()
  }

  return (
    <>
      <div>
        {!transactionHash && (
          <div className="grid items-center grid-cols-6 md:grid-cols-3">
            <div className="col-auto">
              <ArrowBack
                size={20}
                className="cursor-pointer"
                onClick={onBack}
              />
            </div>
            <h1 className="col-span-4 text-lg font-semibold text-center md:col-auto md:text-xl">
              Deploy Subscription
            </h1>
          </div>
        )}
      </div>
      <div>
        {!transactionHash && (
          <div className="grid gap-4 md:grid-cols-2 md:gap-28 pt-8 md:pt-14">
            <div className="flex-col hidden mx-auto md:flex md:max-w-lg">
              <h4 className="mb-4 text-5xl font-bold">
                Deploy your onchain subscription
              </h4>
              <span className="text-xl font-normal">
                For creators who want to monetize their work onchain, with
                recurring payments!
              </span>
              <img
                className="mt-9"
                src="/images/svg/create-lock/members.svg"
                alt="Create lock members"
              />
            </div>
            <div className="md:max-w-lg">
              <CreateLockForm
                onSubmit={onSubmitMutation.mutate}
                hideFields={['quantity']}
                defaultOptions={{
                  expirationDuration: {
                    label: 'Renew every',
                    values: [
                      {
                        label: 'Week',
                        value: 7,
                      },
                      {
                        label: 'Month',
                        value: 30,
                      },
                      {
                        label: 'Quarter',
                        value: 90,
                      },
                    ],
                  },
                  notFree: true,
                  notUnlimited: true,
                  noNative: true,
                }}
                defaultValues={{
                  name: 'My subscription',
                  unlimitedQuantity: true,
                  keyPrice: 5.0,
                  expirationDuration: 30,
                }}
                isLoading={onSubmitMutation.isPending}
              />
            </div>
          </div>
        )}
        {transactionHash && (
          <CreateLockFormSummary
            formData={formData}
            lockAddress={lockAddress}
            transactionHash={transactionHash}
            showStatus
          />
        )}
      </div>
    </>
  )
}

export default Deploy
