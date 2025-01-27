'use client'

import { useSearchParams } from 'next/navigation'
import { CreateLockForm } from '../Create/elements/CreateLockForm'
import { useCallback, useEffect, useState } from 'react'
import {
  ONE_DAY_IN_SECONDS,
  UNLIMITED_KEYS_COUNT,
  UNLIMITED_KEYS_DURATION,
} from '~/constants'
import networks from '@unlock-protocol/networks'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'
import { useCheckoutConfigUpdate } from '~/hooks/useCheckoutConfig'
import { graphService } from '~/config/subgraph'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Placeholder } from '@unlock-protocol/ui'
import { Deployed } from './Deployed'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

export const Deploy: React.FC = () => {
  const searchParams = useSearchParams()
  const { getWalletService } = useProvider()
  const { account } = useAuthenticate()
  const [lockAddress, setLockAddress] = useState<string | undefined>(undefined)

  const { mutateAsync: updateConfig } = useCheckoutConfigUpdate()

  const { data: locks, isPending: isLoadingLocks } = useQuery({
    queryKey: ['locks', account, searchParams.get('chainId')],
    queryFn: async () => {
      const locks = await graphService.locks(
        {
          first: 100,
          where: {
            lockManagers_contains: [account?.toLowerCase()],
            tokenAddress: searchParams.get('address')?.toString().toLowerCase(),
          },
        },
        {
          networks: [Number(searchParams.get('chainId'))],
        }
      )
      return locks
    },
    enabled:
      !!searchParams.get('chainId') &&
      !!account &&
      !!searchParams.get('address'),
  })

  useEffect(() => {
    if (locks && locks[0]) {
      setLockAddress(locks[0].address)
    }
  }, [locks])

  const onLockDeployed = useCallback(
    async ({
      lockAddress,
      network,
    }: {
      lockAddress: string
      network: number
    }) => {
      await locksmith.updateLockMetadata(network, lockAddress, {
        metadata: {
          image: searchParams.get('mediaUri')?.toString(),
        },
      })
      await updateConfig({
        name: `Checkout Config for P00ls Membership for ${lockAddress}`,
        config: {
          title: 'Buy a membership NFT!',
          image: searchParams.get('mediaUri')?.toString(),
          locks: {
            [lockAddress]: {
              network,
            },
          },
        },
      })
      setLockAddress(lockAddress)
    },
    [updateConfig]
  )

  const deployLock = useCallback(
    async (values: {
      network: number
      expirationDuration: number
      name: string
      unlimitedDuration: boolean
      currencyContractAddress: string
      keyPrice: string
    }) => {
      const walletService = await getWalletService(values.network)
      const expirationInSeconds = Math.ceil(
        values.expirationDuration * ONE_DAY_IN_SECONDS
      )
      const lockAddress = await walletService.createLock(
        {
          name: values.name,
          expirationDuration: values.unlimitedDuration
            ? UNLIMITED_KEYS_DURATION
            : expirationInSeconds,
          maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
          currencyContractAddress: values.currencyContractAddress,
          keyPrice: values.keyPrice?.toString(),
          publicLockVersion: networks[values.network].publicLockVersionToDeploy,
        },
        {},
        (error: any) => {
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
      // ok great, we now have a lock Address! Let's update the metadata!
      onLockDeployed({ lockAddress, network: values.network })
    },
    [getWalletService, onLockDeployed]
  )

  const onSubmitMutation = useMutation({
    mutationFn: deployLock,
  })

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex-col hidden mx-auto md:flex md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">
            Deploy your membership contract
          </h4>
          <span className="text-xl font-normal">
            For creative communities and the humans who build them.
          </span>
          <img
            className="mt-9"
            src="/images/svg/create-lock/members.svg"
            alt="Create lock members"
          />
        </div>
        <div className="md:max-w-lg">
          {isLoadingLocks && (
            <Placeholder.Root>
              <Placeholder.Line size="sm" />
              <Placeholder.Line size="sm" />
              <Placeholder.Image className="h-[600px] w-full"></Placeholder.Image>
              <Placeholder.Root>
                <div className="flex justify-center gap-6">
                  <Placeholder.Image className="w-9 h-9" />
                  <Placeholder.Image className="w-9 h-9" />
                </div>
              </Placeholder.Root>
            </Placeholder.Root>
          )}
          {!isLoadingLocks && !locks?.length && !lockAddress && (
            <CreateLockForm
              onSubmit={onSubmitMutation.mutate}
              hideFields={['network', 'currency', 'quantity']}
              defaultValues={{
                currencyContractAddress: searchParams
                  .get('address')
                  ?.toString(),
                name: 'P00ls Membership',
                unlimitedQuantity: true,
                unlimitedDuration: false,
                isFree: false,
                network: Number(searchParams.get('chainId')?.toString()),
              }}
              isLoading={onSubmitMutation.isPending}
            />
          )}
          {lockAddress && (
            <Deployed
              lockAddress={lockAddress}
              network={Number(searchParams.get('chainId')?.toString())}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Deploy
