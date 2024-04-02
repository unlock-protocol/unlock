import { Placeholder } from '@unlock-protocol/ui'
import { useSocials } from '~/hooks/useSocials'

interface HostsProps {
  organizers?: string[]
}

export const Hosts = ({ organizers }: HostsProps) => {
  const { data, loading, error } = useSocials(organizers || [])

  if (loading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return <div></div>
}

export default Hosts
