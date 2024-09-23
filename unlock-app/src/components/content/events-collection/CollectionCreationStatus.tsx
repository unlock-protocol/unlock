import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/navigation'
import { AnimationContent } from '~/components/interface/locks/Create/elements/CreateLockFormSummary'

interface CollectionCreationStatusProps {
  isCreating: boolean
  success: boolean
  createdSlug: string | null
}

export const CollectionCreationStatus = ({
  isCreating,
  success,
  createdSlug,
}: CollectionCreationStatusProps) => {
  const router = useRouter()

  if (isCreating) {
    return (
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        <div className="flex flex-col items-center text-center">
          <AnimationContent status="progress" />
          <h2 className="mt-4 text-lg font-semibold">
            Creating your collection...
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we set up your new event collection.
          </p>
        </div>
      </div>
    )
  }

  if (success && createdSlug) {
    return (
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        <div className="flex flex-col items-center text-center">
          <AnimationContent status="deployed" />
          <p className="mt-4 text-lg font-semibold">
            Collection created successfully!
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/events/${createdSlug}`)}
          >
            Visit Your New Collection
          </Button>
        </div>
      </div>
    )
  }

  return null
}
