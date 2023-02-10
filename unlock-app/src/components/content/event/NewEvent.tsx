import { useState } from 'react'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { storage } from '~/config/storage'

import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'

export interface TransactionDetails {
  hash: string
  network: number
}

export const NewEvent = () => {
  const walletService = useWalletService()
  const config = useConfig()
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const [lockAddress, setLockAddress] = useState<string>()

  const onSubmit = async (formData: NewEventForm) => {
    let lockAddress
    try {
      lockAddress = await walletService.createLock(
        {
          ...formData.lock,
          publicLockVersion: config.publicLockVersion,
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
      ToastHelper.error(`The contract could not be deployed. Please try again.`)
    }

    if (lockAddress) {
      // Save this:
      const lockResponse = await storage.updateLockMetadata(
        formData.network,
        lockAddress!,
        {
          metadata: formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
          }),
        }
      )
      console.log(lockResponse)

      // Finally
      setLockAddress(lockAddress)
    }
  }

  return (
    <AppLayout showLinks={false} authRequired={true}>
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        {transactionDetails && (
          <LockDeploying
            transactionDetails={transactionDetails}
            lockAddress={lockAddress}
          />
        )}
        {!transactionDetails && <Form onSubmit={onSubmit} />}
      </div>
    </AppLayout>
  )
}

export default NewEvent
