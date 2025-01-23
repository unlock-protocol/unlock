import { SubgraphService } from '@unlock-protocol/unlock-js'

interface listManagersProps {
  lockAddress: string
  network: number
}

export default async function listManagers({
  lockAddress,
  network,
}: listManagersProps) {
  const service = new SubgraphService()
  const lock = await service.lock(
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
