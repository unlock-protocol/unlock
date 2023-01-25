import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { UpdateMetadataForm } from '../../components/interface/locks/metadata'
import Link from 'next/link'
import { BsArrowLeft as BackIcon } from 'react-icons/bs'

const Metadata: NextPage = () => {
  const router = useRouter()
  const lockAddress = router.query.lockAddress?.toString()?.toLowerCase()
  const network = router.query.network
    ? Number(router.query.network)
    : undefined
  const keyId = router.query.keyId?.toString()?.toLowerCase()

  const backHref =
    lockAddress && network
      ? `/locks/lock?address=${lockAddress}&network=${network}`
      : '/locks'
  return (
    <AppLayout>
      <div>
        <Link className="cursor-pointer hover:text-ui-main-500" href={backHref}>
          <BackIcon size={20} />
        </Link>
      </div>
      <UpdateMetadataForm
        lockAddress={lockAddress!}
        network={network!}
        keyId={keyId}
      />
    </AppLayout>
  )
}

export default Metadata
