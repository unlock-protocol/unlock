import { Button } from '@unlock-protocol/ui'
import { useList } from 'react-use'
import { AirdropMember, AirdropListItem } from './AirdropElements'
import { useDropzone } from 'react-dropzone'
import { parse } from 'csv/sync'
import { RiCloseLine as ClearIcon } from 'react-icons/ri'
import { Lock } from '~/unlockTypes'
import { getAddressForName } from '~/hooks/useEns'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  lock: Lock
  onConfirm(members: AirdropMember[]): void | Promise<void>
}

export function AirdropBulkForm({ lock, onConfirm }: Props) {
  const [list, { set, clear, removeAt }] = useList<AirdropMember>([])
  const web3Service = useWeb3Service()
  const [errorMessage, setErrorMessage] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.csv'],
    },
    onDropAccepted: async ([file]) => {
      const text = await file.text()
      const json: any[] =
        parse(text, {
          delimiter: ',',
          columns: true,
        }) || []

      const members = await Promise.all(
        json.map(async (item) => {
          try {
            const record = AirdropMember.parse(item)
            const recipient = await getAddressForName(record.recipient)
            const balance = await web3Service.totalKeys(
              lock.address,
              recipient,
              lock.network
            )
            // if total keys is higher than maxKeysPerAddress, we discard the member
            if (balance >= (lock.maxKeysPerAddress || 1)) {
              return
            }

            const member = {
              ...record,
              recipient,
              expiration: item.expiration,
            }
            return member
          } catch (error) {
            console.error(error)
            if (!errorMessage) {
              setErrorMessage('A few recepients were discarded due to error')
            }
            return
          }
        })
      )
      // Filter undefined or null values.
      const filteredMembers = members.filter(
        (item) => !!item
      ) as AirdropMember[]

      set(filteredMembers)
    },
  })

  useEffect(() => {
    if (errorMessage) {
      ToastHelper.error(errorMessage)
    }
  }, [errorMessage])

  return (
    <div>
      {list.length > 0 ? (
        <div className="grid gap-y-6">
          <div className="flex items-center justify-between w-full">
            <div>{list.length} records </div>
            <Button
              iconRight={<ClearIcon size={18} key="clear" />}
              size="small"
              onClick={() => {
                clear()
              }}
            >
              Clear
            </Button>
          </div>
          {list.map((value, index) => (
            <AirdropListItem
              key={index}
              value={value}
              onRemove={(event) => {
                event.preventDefault()
                removeAt(index)
              }}
            />
          ))}
          <Button
            loading={isConfirming}
            disabled={isConfirming}
            onClick={async (event) => {
              event.preventDefault()
              setIsConfirming(true)
              await onConfirm(list)
              setIsConfirming(false)
              clear()
            }}
          >
            Confirm aidrop
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <p>
            Once you upload the csv, you can see all the members. Lock&apos;s
            default expiration will be used in case of no expiration provided.
          </p>
          <div
            className="flex flex-col items-center justify-center bg-white border rounded cursor-pointer group aspect-1 group-hover:border-gray-300"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500 group-hover:text-gray-800">
              Drop your members csv file.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
