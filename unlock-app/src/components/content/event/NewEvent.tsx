import { useEffect, useState } from 'react'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'

export interface TransactionDetails {
  hash: string
  network: number
}

export const NewEvent = () => {
  const { changeNetwork, account } = useAuth()
  const walletService = useWalletService()
  const config = useConfig()
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const [lockAddress, setLockAddress] = useState<string>()
  const [metadata, setMetadata] = useState<MetadataFormData>()

  const onSubmit = async (formData: NewEventForm) => {
    // prompt the user to change network if applicable
    await changeNetwork(formData.network)
    setMetadata({
      name: formData.lock.name,
      ...formData.metadata,
    })

    let lockAddress = '0x9b6e9a74254e7d3572905c0525eed8d3beb66f86'
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

    // TODO REMOVE ME!
    setTransactionDetails({
      hash: '0xe4721745b3564336b2fbf5e559ebbe9740fb176f74190db2637c3afe7d48c344',
      network: 5,
    })

    if (lockAddress) {
      setLockAddress(lockAddress)
    }
  }

  // TODO: remove me when ready
  useEffect(() => {
    if (account) {
      setTimeout(() => {
        onSubmit({
          network: 5,
          lock: {
            name: 'My Party',
            expirationDuration: -1,
            maxNumberOfKeys: 1337,
            currencyContractAddress:
              '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
            keyPrice: '1',
          },
          currencySymbol: 'USDC',
          metadata: {
            description: 'Is really nice',
            ticket: {
              event_start_date: '2023-02-21',
              event_start_time: '21:55',
              event_timezone: 'America/Montreal',
              event_address: '5 Stafford Place, 10538 Larchmont',
            },
            image:
              'data:image/jpeg;base64,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',
          },
        })
      }, 100)
    }
  }, [account])

  return (
    <AppLayout showLinks={false} authRequired={true}>
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        {transactionDetails && (
          <LockDeploying
            metadata={metadata}
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
