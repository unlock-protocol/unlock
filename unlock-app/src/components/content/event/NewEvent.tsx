import { useState } from 'react'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { storage } from '~/config/storage'
import { networks } from '@unlock-protocol/networks'

import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSaveLockSettings } from '~/hooks/useLockSettings'
import { getSlugForName } from '~/utils/slugs'

export interface TransactionDetails {
  hash: string
  network: number
}

export const NewEvent = () => {
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const [slug, setSlug] = useState<string | undefined>(undefined)
  const [lockAddress, setLockAddress] = useState<string>()
  const { getWalletService } = useAuth()

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const onSubmit = async (formData: NewEventForm) => {
    let lockAddress
    const walletService = await getWalletService(formData.network)

    try {
      lockAddress = await walletService.createLock(
        {
          ...formData.lock,
          name: formData.lock.name,
          publicLockVersion:
            networks[formData.network].publicLockVersionToDeploy,
        },
        {} /** transactionParams */,
        async (createLockError, transactionHash) => {
          if (createLockError) {
            throw createLockError
          }
          if (transactionHash) {
            setTransactionDetails({
              hash: transactionHash,
              network: formData.network,
            })
          }
        }
      ) // Deploy the lock! and show the "waiting" screen + mention to *not* close!
    } catch (error) {
      console.error(error)
      ToastHelper.error(`The contract could not be deployed. Please try again.`)
    }
    formData.metadata.slug = await getSlugForName(formData.lock.name)
    if (lockAddress) {
      // Save this:
      await storage.updateLockMetadata(formData.network, lockAddress!, {
        metadata: formDataToMetadata({
          name: formData.lock.name,
          ...formData.metadata,
        }),
      })

      // Save slug for URL if present
      setSlug(formData?.metadata?.slug)

      const slug = formData?.metadata.slug
      if (slug) {
        await saveSettingsMutation({
          lockAddress,
          network: formData.network,
          slug,
        })
      }
      // Finally
      setLockAddress(lockAddress)
    }
  }

  return (
    <AppLayout
      showLinks={false}
      authRequired={true}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        {transactionDetails && (
          <LockDeploying
            transactionDetails={transactionDetails}
            lockAddress={lockAddress}
            slug={slug}
          />
        )}
        {!transactionDetails && <Form onSubmit={onSubmit} />}
      </div>
    </AppLayout>
  )
}

export default NewEvent
