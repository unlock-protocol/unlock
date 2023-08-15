import { networks } from '@unlock-protocol/networks'
import { useState } from 'react'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { ToastHelper } from '~/components/helpers/toast.helper'

import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CertificationForm, NewCertificationForm } from './CertificationForm'
import { CertificationDeploying } from './CertificationDeploying'
import { UNLIMITED_KEYS_COUNT, UNLIMITED_KEYS_DURATION } from '~/constants'
import { useSaveLockSettings } from '~/hooks/useLockSettings'
import { getSlugForName } from '~/utils/slugs'
import { storage } from '~/config/storage'

export interface TransactionDetails {
  hash: string
  network: number
}

export const NewCertification = () => {
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const [lockAddress, setLockAddress] = useState<string>()
  const { getWalletService } = useAuth()
  const [slug, setSlug] = useState<string | undefined>(undefined)

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const onSubmit = async (formData: NewCertificationForm) => {
    let lockAddress
    const walletService = await getWalletService(formData.network)
    try {
      formData.metadata.slug = await getSlugForName(formData.lock.name)
      const lockParams = {
        ...formData.lock,
        name: formData.lock.name,

        publicLockVersion: networks[formData.network].publicLockVersionToDeploy,
        maxNumberOfKeys: formData.unlimitedQuantity
          ? UNLIMITED_KEYS_COUNT
          : formData?.lock?.maxNumberOfKeys,
        expirationDuration:
          formData?.lock?.expirationDuration * 60 * 60 * 24 ||
          UNLIMITED_KEYS_DURATION,
      }
      lockAddress = await walletService.createLock(
        lockParams,
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
    <AppLayout showLinks={false} authRequired={true}>
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        {transactionDetails && (
          <CertificationDeploying
            transactionDetails={transactionDetails}
            lockAddress={lockAddress}
            slug={slug}
          />
        )}
        {!transactionDetails && <CertificationForm onSubmit={onSubmit} />}
      </div>
    </AppLayout>
  )
}

export default NewCertification
