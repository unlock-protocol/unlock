import { ManageLockContent } from '~/components/interface/locks/Manage'

interface PageProps {
  searchParams: Promise<{
    network?: string
    address?: string
  }>
}

const ManageLockPage = async ({ searchParams }: PageProps) => {
  const { network: networkParam, address } = await searchParams
  const network = networkParam || ''
  const lockAddress = address || ''

  return <ManageLockContent network={network} lockAddress={lockAddress} />
}

export default ManageLockPage
