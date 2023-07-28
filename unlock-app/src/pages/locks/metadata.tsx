import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { UpdateMetadataForm } from '../../components/interface/locks/metadata'
import { BsArrowLeft as BackIcon } from 'react-icons/bs'
import { Button } from '@unlock-protocol/ui'

const Metadata: NextPage = () => {
  const router = useRouter()
  const lockAddress = router.query.lockAddress?.toString()?.toLowerCase()
  const network = router.query.network
    ? Number(router.query.network)
    : undefined
  const keyId = router.query.keyId?.toString()?.toLowerCase()

  return (
    <AppLayout>
      <Button variant="borderless" aria-label="arrow back">
        <BackIcon
          size={20}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
      </Button>

      <UpdateMetadataForm
        lockAddress={lockAddress!}
        network={network!}
        keyId={keyId}
      />
    </AppLayout>
  )
}

export default Metadata
