'use client'

import { useSearchParams } from 'next/navigation'
import { BsArrowLeft as BackIcon } from 'react-icons/bs'
import { Button } from '@unlock-protocol/ui'
import { UpdateMetadataForm } from '~/components/interface/locks/metadata'

const LocksMetadataContent = () => {
  const searchParams = useSearchParams()
  const lockAddress = searchParams.get('lockAddress')?.toLowerCase()
  const network = searchParams.get('network')
    ? Number(searchParams.get('network'))
    : undefined
  const keyId = searchParams.get('keyId')?.toLowerCase()

  return (
    <div className="flex flex-col items-start">
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
    </div>
  )
}

export default LocksMetadataContent
