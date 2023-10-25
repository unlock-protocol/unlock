import { Button, Drawer, ImageUpload } from '@unlock-protocol/ui'
import {
  MetadataFormData,
  PaywallConfigType,
  formDataToMetadata,
} from '@unlock-protocol/core'
import { useState } from 'react'
import { useUpdateMetadata } from '~/hooks/metadata'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { storage } from '~/config/storage'

interface CoverImageDrawerProps {
  image: string
  setImage: (image: string) => void
  handleClose: () => void
  event: any
  checkoutConfig: PaywallConfigType
}

export const CoverImageDrawer = ({
  image,
  setImage,
  event,
  checkoutConfig,
  handleClose,
}: CoverImageDrawerProps) => {
  console.log(checkoutConfig)
  const [isOpen, setIsOpen] = useState(false)
  // Check if the user is one of the lock manager
  const { data: isOrganizer } = useEventOrganizer({
    checkoutConfig,
  })
  console.log({ event })

  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  // const { mutateAsync: updateMetadata, isLoading } = useUpdateMetadata({
  //   lockAddress,
  //   network,
  // })

  const coverImage = event.event_cover_image

  const onSubmit = async () => {
    event.ticket.event_cover_image = image
    console.log('save event with image set!', event, checkoutConfig)
    await storage.saveEventData({
      data: formDataToMetadata(event),
      checkoutConfig,
    })
    console.log('RELOAD!')

    // const metadataObj = formDataToMetadata({
    //   ...metadata,
    //   ticket: {
    //     ...metadata?.ticket,
    //     event_cover_image: image,
    //   },
    // })
    // await updateMetadata(metadataObj)
    // setIsOpen(false)
    // handleClose()
  }

  return (
    <div className="relative inset-0 z-[1]">
      {isOrganizer && (
        <Button
          className="absolute bottom-3 right-3 md:bottom-8 nd:right-9"
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
              description="This illustration will be used as cover image for your event page"
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
