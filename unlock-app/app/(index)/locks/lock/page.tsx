import { ManageLockContent } from '~/components/interface/locks/Manage'

interface PageProps {
  searchParams: {
    network?: string
    address?: string
  }
}

const ManageLockPage = async ({ searchParams }: PageProps) => {
  const network = searchParams.network || ''
  const lockAddress = searchParams.address || ''

  return <ManageLockContent network={network} lockAddress={lockAddress} />
}

export default ManageLockPage
