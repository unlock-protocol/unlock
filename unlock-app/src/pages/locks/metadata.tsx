import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { UpdateMetadataForm } from '../../components/interface/locks/metadata'

const Metadata: NextPage = () => {
  const router = useRouter()
  const lockAddress = router.query.lockAddress?.toString()?.toLowerCase()
  const network = router.query.network
    ? Number(router.query.network)
    : undefined
  const keyId = router.query.keyId?.toString()?.toLowerCase()

  return (
    <AppLayout>
      <UpdateMetadataForm
        lockAddress={lockAddress!}
        network={network!}
        keyId={keyId}
      />
    </AppLayout>
  )
}

export default Metadata
