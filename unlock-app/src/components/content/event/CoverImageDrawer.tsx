import { Button, Drawer, ImageUpload } from '@unlock-protocol/ui'
import {
  Event,
  PaywallConfigType,
  formDataToMetadata,
} from '@unlock-protocol/core'
import { useState } from 'react'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { locksmith } from '~/config/locksmith'

interface CoverImageDrawerProps {
  image: string
  setImage: (image: string) => void
  handleClose: () => void
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const CoverImageDrawer = ({
  image,
  setImage,
  event,
  checkoutConfig,
  handleClose,
}: CoverImageDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  // Check if the user is one of the lock manager
  const { data: isOrganizer } = useEventOrganizer({
    checkoutConfig,
  })

  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()

  const coverImage = event.ticket.event_cover_image

  const onSubmit = async () => {
    event.ticket.event_cover_image = image
    await locksmith.saveEventData({
      data: formDataToMetadata(event),
      // @ts-expect-error
      checkoutConfig,
    })

    setIsOpen(false)
    handleClose()
  }

  return (
    <div className="absolute hidden sm:block sm:overflow-hidden inset-0 z-[1] ">
      {isOrganizer && (
        <Button
          className="absolute md:top-4 md:right-4"
          variant="secondary"
          size="tiny"
          onClick={() => {
            setIsOpen(true)
            setImage(coverImage || '')
          }}
        >
          {coverImage ? 'Change image' : 'Upload Image'}
        </Button>
      )}
      <div className="relative">
        <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Cover image">
          <div className="z-10 mt-2 space-y-6">
            <ImageUpload
              size="full"
              description="This illustration will be used as cover image for your event page. The recommended aspect ratio is 1400x300."
              preview={image}
              isUploading={isUploading}
              imageRatio="cover"
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setImage(fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setImage(image)
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            size="small"
            type="submit"
            onClick={onSubmit}
            loading={false}
            disabled={image === coverImage}
          >
            Save
          </Button>
        </Drawer>
      </div>
    </div>
  )
}
