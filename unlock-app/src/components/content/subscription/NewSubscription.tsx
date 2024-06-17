import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import {
  ONE_DAY_IN_SECONDS,
  UNLIMITED_KEYS_COUNT,
  UNLIMITED_KEYS_DURATION,
} from '~/constants'
import networks from '@unlock-protocol/networks'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { storage } from '~/config/storage'
import { useCheckoutConfigUpdate } from '~/hooks/useCheckoutConfig'
import { useMutation } from '@tanstack/react-query'
// import { Deployed } from './Deployed'
import { CreateLockForm } from '~/components/interface/locks/Create/elements/CreateLockForm'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'

export const Deploy: React.FC = () => {
  const { query } = useRouter()
  const { getWalletService, network } = useAuth()
  const [_, setLockAddress] = useState<string | undefined>(undefined)

  const { mutateAsync: updateConfig } = useCheckoutConfigUpdate()

  const onLockDeployed = useCallback(
    async ({
      lockAddress,
      network,
    }: {
      lockAddress: string
      network: number
    }) => {
      await storage.updateLockMetadata(network, lockAddress, {
        metadata: {
          image: query.mediaUri?.toString(),
        },
      })
      await updateConfig({
        name: `Checkout Config for P00ls Membership for ${lockAddress}`,
        config: {
          title: `Buy a membership NFT!`,
          image: query.mediaUri?.toString(),
          locks: {
            [lockAddress]: {
              network,
            },
          },
        },
      })
      setLockAddress(lockAddress)
    },
    [updateConfig, query.mediaUri]
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
      console.log({ values })
      const walletService = await getWalletService(values.network)
      const expirationInSeconds = values.expirationDuration * ONE_DAY_IN_SECONDS
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

  const onSubmitMutation = useMutation(deployLock)

  const currencies =
    networks[network!].tokens?.filter((token) => token.featured) || []

  return (
    <BrowserOnly>
      <AppLayout>
        <div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-28">
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
                        value: 60 * 60 * 24 * 7,
                      },
                      {
                        label: 'Month',
                        value: 60 * 60 * 24 * 30,
                      },
                      {
                        label: 'Quarter',
                        value: 60 * 60 * 24 * 91,
                      },
                    ],
                  },
                  currencies,
                  notFree: true,
                  notUnlimited: true,
                }}
                defaultValues={{
                  name: 'My subscription',
                  unlimitedQuantity: true,
                  keyPrice: 5.0,
                  expirationDuration: 60 * 60 * 24 * 30,
                  currencyContractAddress: currencies[0]?.address,
                }}
                isLoading={onSubmitMutation.isLoading}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    </BrowserOnly>
  )
}

export default Deploy
