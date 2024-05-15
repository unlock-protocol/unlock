import { useRouter } from 'next/router'
import { CreateLockForm } from '../Create/elements/CreateLockForm'
import { use, useCallback, useEffect, useState } from 'react'
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
import { subgraph } from '~/config/subgraph'
import { useQuery } from '@tanstack/react-query'
import { Placeholder } from '@unlock-protocol/ui'
import { Deployed } from './Deployed'

export const Deploy: React.FC = () => {
  const { query } = useRouter()
  const { getWalletService, account } = useAuth()
  const [lockAddress, setLockAddress] = useState<string | undefined>(undefined)

  const { mutateAsync: updateConfig } = useCheckoutConfigUpdate()

  const { data: locks, isLoading: isLoadingLocks } = useQuery(
    ['locks', account, query.chainId],
    async () => {
      const locks = await subgraph.locks(
        {
          first: 100,
          where: {
            lockManagers_contains: [account?.toLowerCase()],
            tokenAddress: query.address?.toString().toLowerCase(),
          },
        },
        {
          networks: [Number(query.chainId)],
        }
      )
      return locks
    },
    {
      enabled: !!query.chainId && !!account && !!query.address,
    }
  )

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
      await storage.updateLockMetadata(network, lockAddress, {
        metadata: {
          image: query.mediaUri?.toString(),
        },
      })
      await updateConfig({
        name: `Checkout Config for P00ls Membership for ${lockAddress}`,
        config: {
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

  const onSubmit = useCallback(
    async (values: {
      network: number
      expirationDuration: number
      name: string
      unlimitedDuration: boolean
      currencyContractAddress: string
      keyPrice: string
    }) => {
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
        (error: any, transactionHash) => {
          if (error) {
            console.error(error)
            ToastHelper.error(
              'Unexpected issue on lock creation, please try again'
            )
          } else {
            ToastHelper.success('Transaction sent, waiting for confirmation...')
            console.log(transactionHash)
          }
        }
      )
      // ok great, we now have a lock Address! Let's update the metadata!
      onLockDeployed({ lockAddress, network: values.network })
    },
    [getWalletService, onLockDeployed]
  )

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
          {!isLoadingLocks && !locks?.length && (
            <CreateLockForm
              onSubmit={onSubmit}
              hideFields={['network', 'currency', 'quantity']}
              defaultValues={{
                currencyContractAddress: query.address?.toString(),
                name: 'P00ls Membership',
                unlimitedQuantity: true,
                unlimitedDuration: false,
                isFree: false,
                network: Number(query.chainId?.toString() || 137),
              }}
            />
          )}
          {lockAddress && (
            <Deployed lockAddress={lockAddress} network={query.network} />
          )}
        </div>
      </div>
    </div>

    // <div>
    //   <p>Create an NFT Membership priced in $TOKEN NAME!</p>
    //   <p>Name</p>
    //   <p>Duration</p>
    //   <p>Price</p>
    //   <Button>Next</Button>
    // </div>
  )
}

export default Deploy
