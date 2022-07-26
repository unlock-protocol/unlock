import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStorageService } from '~/utils/withStorageService'
import React from 'react'
import { useWalletService } from '~/utils/withWalletService'
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
  const [metadata, setMetadata] = useState<{ [key: string]: any }>()
  const [loading, setLoading] = useState(false)
  const storageService = useStorageService()
  const walletService = useWalletService()
  const { register } = useForm()

  useEffect(() => {
    if (!isOpen) return

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
  }, [
    account,
    isOpen,
    keyId,
    lock.address,
    lock.owner,
    network,
    storageService,
    walletService,
  ])

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
            <form action="">
              {values?.map(([key, value], index) => {
                return (
                  <Input
                    label={key}
                    disabled={true}
                    key={index}
                    {...register(key, {
                      value,
                    })}
                  />
                )
              })}
            </form>
          ) : (
            <div>There is no metadata associated with that key.</div>
          )}
          <div className="flex mt-auto">
            <Button
              className="ml-auto"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
