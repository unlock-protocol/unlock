import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { UpdateMetadataForm } from '../../components/interface/locks/metadata'
import { useEffect, useState } from 'react'
import { LockPicker } from '~/components/interface/locks/Manage/elements/LockPicker'
import { useAuth } from '~/contexts/AuthenticationContext'

const Metadata: NextPage = () => {
  const router = useRouter()
  const { account } = useAuth()
  const lockAddressValue = router.query.lockAddress?.toString()?.toLowerCase()
  const networkValue = router.query.network
    ? Number(router.query.network)
    : undefined
  const keyId = router.query.keyId?.toString()?.toLowerCase()
  const [network, setNetwork] = useState<number | undefined>()
  const [lockAddress, setLockAddress] = useState<string | undefined>()

  const isLockSelected = network && lockAddress

  useEffect(() => {
    setLockAddress(lockAddressValue)
    setNetwork(networkValue)
  }, [lockAddressValue, networkValue])

  return (
    <AppLayout>
      {!isLockSelected && (
        <div className="space-y-2">
          <h3 className="mb-2 text-lg font-bold text-brand-ui-primary">
            Select lock to edit properties
          </h3>
          <LockPicker
            owner={account!}
            onChange={(lockAddress, network) => {
              setLockAddress(lockAddress)
              if (network) {
                setNetwork(
                  typeof network === 'string' ? parseInt(network) : network
                )
              }
            }}
          />
        </div>
      )}
      {isLockSelected && (
        <UpdateMetadataForm
          lockAddress={lockAddress}
          network={network}
          keyId={keyId}
        />
      )}
    </AppLayout>
  )
}

export default Metadata
