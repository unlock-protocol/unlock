import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStorageService } from '~/utils/withStorageService'
import React from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'
interface MetadataModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  keyId: string
  network: number
  lock: any
  account: string
}

const KeyMetadataPlaceholder: React.FC<unknown> = () => {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="w-[120px] h-[24px] bg-slate-200 animate-pulse"></div>
      <div className="w-full h-[30px] rounded-lg bg-slate-200 animate-pulse"></div>
      <div className="w-full h-[30px] rounded-lg bg-slate-200 animate-pulse"></div>
      <div className="w-full h-[30px] rounded-lg bg-slate-200 animate-pulse"></div>
      <div className="w-full h-[30px] rounded-lg bg-slate-200 animate-pulse"></div>
      <div className="flex">
        <div className="ml-auto w-[100px] h-[40px] bg-slate-200 animate-pulse rounded-full"></div>
      </div>
    </div>
  )
}
export const KeyMetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  setIsOpen,
  keyId,
  lock,
  network,
  account,
}) => {
  const [metadata, setMetadata] = useState<{ [key: string]: string | number }>()
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const storageService = useStorageService()
  const walletService = useWalletService()
  const {
    register,
    formState: { isDirty, errors },
    getValues,
    handleSubmit,
    trigger,
    reset,
  } = useForm()

  useEffect(() => {
    if (!isOpen) return

    try {
      const login = async () => {
        return await storageService.loginPrompt({
          walletService,
          address: account!,
          chainId: network!,
        })
      }
      const getData = async () => {
        setLoading(true)
        await login()
        const data = await storageService.getKeyMetadataValues({
          lockAddress: lock.address,
          keyId: parseInt(keyId, 10),
          network,
        })
        setLoading(false)
        setMetadata({
          ...data?.userMetadata?.protected,
          ...data?.userMetadata?.public,
        })
      }
      getData()
    } catch (err) {
      ToastHelper.error('There is some unexpected issue, please try again')
    }
  }, [
    account,
    isOpen,
    keyId,
    lock.address,
    lock.owner,
    network,
    reset,
    storageService,
    walletService,
  ])

  const onUpdateMetadata = async () => {
    try {
      const valid = await trigger()
      setUpdating(true)
      if (valid) {
        const params = {
          lockAddress: lock.address,
          network,
          userAddress: account,
          metadata: getValues(),
        }
        const updatePromise = storageService.updatetMetadata(params)
        await ToastHelper.promise(updatePromise, {
          success: 'Metadata succesfully updated',
          error: 'There is some unexpected issue, please try again',
          loading: 'Updating metadata',
        })
        reset({
          ...getValues(),
        }) // reset form status + set new values
      }
      setUpdating(false)
    } catch (err) {
      ToastHelper.error('There is some unexpected issue, please try again')
    }
  }

  const values = Object.entries(metadata ?? {})
  const hasValues = values?.length > 0

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {loading ? (
        <KeyMetadataPlaceholder />
      ) : (
        <div className="flex flex-col gap-3 p-4 min-h-[300px] text-left">
          <span className="font-semibold text-lg">
            {`${lock.name} - Metadata`}{' '}
          </span>
          {hasValues ? (
            <form
              onSubmit={handleSubmit(onUpdateMetadata)}
              className="flex flex-col gap-3"
            >
              {values?.map(([key, value], index) => {
                return (
                  <div key={index}>
                    <Input
                      label={key}
                      key={index}
                      disabled={updating}
                      {...register(key, {
                        value,
                        required: true,
                      })}
                    />
                    {errors?.[key] && (
                      <span className="text-[#f24c15] text-xs">
                        This field is required
                      </span>
                    )}
                  </div>
                )
              })}
            </form>
          ) : (
            <div>There is no metadata associated with that key.</div>
          )}
          <div className="flex mt-auto gap-3">
            <Button
              className="ml-auto"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            {hasValues && (
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || updating}
                onClick={onUpdateMetadata}
              >
                Update metadata
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
