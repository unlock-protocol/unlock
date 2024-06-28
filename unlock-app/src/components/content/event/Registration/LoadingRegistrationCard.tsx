import { Placeholder } from '@unlock-protocol/ui'
import LoadingIcon from '~/components/interface/Loading'

export const LoadingRegistrationCard = () => {
  return (
    <>
      <div className="flex flex-row align-middle gap-2">
        <LoadingIcon size={24} />
        <p className="text-gray-600">Loading ticket options...</p>
      </div>
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="lg" />
      </Placeholder.Root>
      <Placeholder.Root inline>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="lg" />
      </Placeholder.Root>
    </>
  )
}
