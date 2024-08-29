import { NextPage } from 'next'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { UpdateMetadataForm } from '../../components/interface/locks/metadata'
import { BsArrowLeft as BackIcon } from 'react-icons/bs'
import { Button } from '@unlock-protocol/ui'

const Metadata: NextPage = () => {
  const searchParams = useSearchParams()
  const lockAddress = searchParams.get('lockAddress')?.toLowerCase()
  const network = searchParams.get('network')
    ? Number(searchParams.get('network'))
    : undefined
  const keyId = searchParams.get('keyId')?.toLowerCase()

  return (
    <AppLayout>
      <Button
        variant="borderless"
        aria-label="arrow back"
        onClick={() => window.history.back()}
      >
        <BackIcon size={20} className="cursor-pointer" />
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
