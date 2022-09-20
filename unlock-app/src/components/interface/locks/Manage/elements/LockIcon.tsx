import React, { Fragment, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { FiEdit as EditIcon } from 'react-icons/fi'
import { Button, Input } from '@unlock-protocol/ui'
import { Transition, Dialog, Tab } from '@headlessui/react'
import useAccount from '~/hooks/useAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MdOutlineClose as CloseIcon } from 'react-icons/md'

interface LockIconProps {
  lockAddress: string
  network: number
  loading?: boolean
}

interface IconModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  network: number
  imageUrl: string
  dismiss: (url: string | null) => void
}

export const IconModal = ({
  isOpen: active,
  dismiss,
  setIsOpen,
  imageUrl: current,
  lockAddress,
  network,
}: IconModalProps) => {
  const [url, setUrl] = useState<string | null>(current)
  const [filename, setFilename] = useState('')
  const [error, setError] = useState<string | null>(null)
  const config = useConfig()
  const { account } = useAuth()
  const { updateLockIcon } = useAccount(account!, network)

  const defaultIconUrl = `${config.services.storage.host}/lock/${lockAddress}/icon?original=1`

  const setImageUrlIfValid = (url: any) => {
    return new Promise((resolve, _reject) => {
      setError(null)
      const image = new Image()
      image.onload = () => {
        if (image.width) {
          setUrl(image.src)
          resolve(true)
        } else {
          setError('This is not a valid image...')
          resolve(false)
        }
      }
      image.onerror = () => {
        setUrl(null)
        setError('This is not a valid image...')
        resolve(false)
      }
      image.src = url
    })
  }

  const imagePicked = async (event: any) => {
    if (event.target.files[0]) {
      const file = event.target.files[0]
      // Max size is 1MB
      if (file.size > 1024 * 1024) {
        setError(
          'This file is too large to be used. Please use a file that is at most 1MB, or use an external URL.'
        )
      } else {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const dataUrl = reader.result
          const isValid = await setImageUrlIfValid(dataUrl)
          if (isValid) {
            setUrl(dataUrl as any)

            setFilename(file?.name)
          }
        }
      }
    }
  }

  const urlPicked = async (event: any) => {
    await setImageUrlIfValid(event.target.value)
  }

  const restoreDefault = () => {
    setUrl(defaultIconUrl)
  }

  const save = async () => {
    event?.preventDefault()
    try {
      await updateLockIcon(lockAddress, network, url!)
      dismiss(url)
    } catch (error) {
      console.error(error)
      setError('This image could not be saved. Please try again, or reach out.')
    }
    return false
  }

  const hiddenFileInput = React.useRef<any>(null)

  const handleFileInputClick = (event: any) => {
    event.preventDefault()
    hiddenFileInput?.current?.click()
    return null
  }

  const resetAndDismiss = () => {
    setError('')
    dismiss(current)
    setIsOpen(false)
  }

  return (
    <>
      <Transition show={active} appear as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={resetAndDismiss}
          open
        >
          <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
          >
            <div className="fixed inset-0 p-6 overflow-y-auto">
              <input
                accept="image/*"
                type="file"
                ref={hiddenFileInput}
                onChange={imagePicked}
                className="w-0 h-0 v"
              />
              <div className="flex items-center justify-center min-h-full">
                <div className="max-w-sm">
                  <div className="w-full p-6 bg-white rounded-2xl">
                    <div className="flex justify-end">
                      <Button
                        variant="transparent"
                        className="p-0 m-0"
                        onClick={resetAndDismiss}
                      >
                        <CloseIcon size={20} />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      <h1 className="text-base font-bold">
                        Customize NFT image
                      </h1>
                      <span className="text-base">
                        Upload an image or select an external URL. Recommend
                        using a square of at least 300x300 pixels.
                      </span>
                    </div>
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center justify-center p-3 border border-gray-400 border-dashed max-h-xs h-60 w-60 rounded-3xl">
                        <img
                          className="object-contain"
                          alt="logo"
                          src={url || ''}
                        />
                      </div>
                    </div>

                    <form className="flex flex-col w-full ">
                      <Tab.Group>
                        <Tab.List className="flex gap-10 pb-2 mt-8 text-sm border-b border-gray-400">
                          <Tab
                            key={'image'}
                            className={({ selected }) =>
                              `${
                                selected ? 'text-brand-ui-primary' : ''
                              } outline-none focus-visible:outline-none`
                            }
                          >
                            Upload file
                          </Tab>
                          <Tab
                            key={'customUrl'}
                            className={({ selected }) =>
                              `${
                                selected ? 'text-brand-ui-primary' : ''
                              } outline-none focus-visible:outline-none`
                            }
                          >
                            Insert URL
                          </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-6">
                          <Tab.Panel key="image">
                            <div className="grid items-center grid-cols-1 gap-2">
                              <div className="col-span-2">
                                <Button
                                  type="button"
                                  id="inputFile"
                                  variant="outlined-primary"
                                  size="small"
                                  className="w-full"
                                  onClick={handleFileInputClick}
                                >
                                  Select file
                                </Button>
                              </div>
                              <span className="col-span-3 text-sm">
                                {filename}
                              </span>
                            </div>
                          </Tab.Panel>
                          <Tab.Panel key="customUrl">
                            <Input
                              style={{ marginBottom: '0px' }}
                              type="text"
                              onChange={urlPicked}
                              className="w-full border-transparent border-none box-shadow:none focus:border-none focus:outline-none"
                              placeholder="https://"
                              size="small"
                            />
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                      <div className="flex flex-col gap-2 py-4">
                        <Button
                          disabled={error !== null || !url}
                          type="submit"
                          onClick={save}
                        >
                          Apply
                        </Button>
                        <Button
                          id="restoreDefaultButton"
                          type="button"
                          variant="transparent"
                          onClick={restoreDefault}
                        >
                          Reset
                        </Button>
                      </div>
                    </form>

                    {error && (
                      <span className="text-sm text-red-500">{error}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

const LockIconPlaceholder = () => {
  return <div className="w-full animate-pulse bg-slate-200 h-80"></div>
}

export const LockIcon = ({ lockAddress, network, loading }: LockIconProps) => {
  const config = useConfig()
  const [isOpen, setIsOpen] = useState(false)

  const [imageSrc, setImageSrc] = useState<string | null>(
    lockAddress
      ? `${config.services.storage.host}/lock/${lockAddress}/icon`
      : '/images/svg/default-lock-logo.svg'
  )

  const handleError = () => {
    setImageSrc('/images/svg/default-lock-logo.svg')
  }

  const onDismiss = (image: string | null) => {
    if (!image) return
    setIsOpen(false)
    setImageSrc(image)
  }

  if (loading) return <LockIconPlaceholder />
  return (
    <>
      <IconModal
        lockAddress={lockAddress}
        network={network}
        dismiss={onDismiss}
        isOpen={isOpen}
        imageUrl={imageSrc!}
        setIsOpen={setIsOpen}
      />
      <div className="relative flex p-4 overflow-hidden bg-white cursor-pointer group rounded-3xl">
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
          onClick={() => {
            setIsOpen(true)
          }}
        >
          <div className="w-full h-full transition duration-300 ease-in bg-black opacity-0 group-hover:opacity-75"></div>
          <div className="absolute transition duration-300 ease-in opacity-0 group-hover:opacity-100">
            <EditIcon size={50} />
          </div>
        </div>

        <img src={imageSrc!} alt="Lock image" onError={handleError} />
      </div>
    </>
  )
}
