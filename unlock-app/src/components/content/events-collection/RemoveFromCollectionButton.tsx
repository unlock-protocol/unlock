import { Modal, Tooltip, Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { FiTrash } from 'react-icons/fi'
import { useRemoveEventFromCollection } from '~/hooks/useEventCollection'

interface RemoveFromCollectionButtonProps {
  collectionSlug: string | undefined
  eventSlug: string
  onRemove: () => void
}

export const RemoveFromCollectionButton = ({
  collectionSlug,
  eventSlug,
  onRemove,
}: RemoveFromCollectionButtonProps) => {
  const [isOpen, setOpen] = useState(false)
  const { removeEventFromCollection, isRemovingEventFromCollection } =
    useRemoveEventFromCollection(collectionSlug!)

  const handleRemoveEvent = async () => {
    await removeEventFromCollection({
      collectionSlug: collectionSlug!,
      eventSlug,
    })
    setOpen(false)
    onRemove()
  }

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setOpen}>
        <div className="w-full">
          <h2 className="text-lg font-bold mb-4">Remove Event</h2>
          <p className="mb-6">
            Are you sure you want to remove this event from the collection?
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              size="small"
              onClick={() => setOpen(false)}
              variant="outlined-primary"
            >
              Cancel
            </Button>
            <Button
              size="small"
              onClick={handleRemoveEvent}
              variant="primary"
              loading={isRemovingEventFromCollection}
            >
              {isRemovingEventFromCollection ? 'Removing' : 'Remove'}
            </Button>
          </div>
        </div>
      </Modal>

      <Tooltip
        delay={0}
        label="Remove from Collection"
        tip="Remove from Collection"
        side="bottom"
      >
        <Button
          onClick={() => setOpen(true)}
          size="small"
          variant="outlined-primary"
        >
          <div className="flex items-center gap-2 justify-center">
            <FiTrash />
            <span>Remove</span>
          </div>
        </Button>
      </Tooltip>
    </>
  )
}

export default RemoveFromCollectionButton
