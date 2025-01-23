import { graphService } from '../config/subgraph'

interface listManagersProps {
  lockAddress: string
  network: number
}

export default async function listManagers({
  lockAddress,
  network,
}: listManagersProps) {
  const lock = await graphService.lock(
    {
      where: {
        address_in: [lockAddress],
      },
    },
    {
      network,
    }
  )
  return lock ? lock.lockManagers : []
}
