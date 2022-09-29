import { Button } from '@unlock-protocol/ui'
import { useList } from 'react-use'
import { AirdropMember, AirdropListItem } from './AirdropElements'
import { useDropzone } from 'react-dropzone'
import { parse } from 'csv/sync'
import { RiCloseLine as ClearIcon } from 'react-icons/ri'
import { Lock } from '~/unlockTypes'
import { getAddressForName } from '~/hooks/useEns'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface Props {
  lock: Lock
  onConfirm(members: AirdropMember[]): void | Promise<void>
}

export function AirdropBulkForm({ lock, onConfirm }: Props) {
  const [list, { set, clear, removeAt }] = useList<AirdropMember>([])
  const web3Service = useWeb3Service()
  const { account } = useAuth()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.csv'],
    },
    onDropRejected: async () => {
      ToastHelper.error(
        'The file cannot be accepted. Try again using the template.'
      )
    },
    onDrop: async () => {
      setIsLoadingMembers(true)
    },
    onDropAccepted: async ([file]) => {
      const text = await file.text()
      let discarded = 0
      const json: any[] =
        parse(text, {
          delimiter: ',',
          columns: true,
        }) || []

      const members = await Promise.all(
        json.map(async (item) => {
          try {
            const record = AirdropMember.parse(item)
            const [recipient, manager] = await Promise.all([
              getAddressForName(record.recipient),
              getAddressForName(record.manager || account!),
            ])

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
              manager,
            }
            return member
          } catch (error) {
            console.error(error)
            return
          }
        })
      )

      const filteredMembers = members.reduce<AirdropMember[]>(
        (filtered, member) => {
          // filter null or undefined values
          if (!member) {
            // keep track of discarded entries
            discarded += 1
            return filtered
          }

          // find existing member
          const existingMember = filtered.find(
            ({ recipient }) => recipient === member.recipient
          )

          // if exist, discard the current entry to avoid duplicate.
          if (existingMember) {
            // keep track of discarded entries
            discarded += 1
            return filtered
          }

          // push the item to array if new unique member found
          filtered.push(member)

          return filtered
        },
        []
      )

      // Notify how many loaded and discarded.
      ToastHelper.success(
        `Loaded ${filteredMembers.length} members. ${discarded} members discarded.`
      )
      setIsLoadingMembers(false)
      set(filteredMembers)
    },
  })

  const items = list.length > 0

  return (
    <div>
      {!items && (
        <div>
          {isLoadingMembers && (
            <div className="space-y-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full h-8 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}
          {!isLoadingMembers && (
            <div className="space-y-6">
              <p>
                Once you upload the csv, you can see all the members. Once you
                upload the csv, you can see all the list of memberships to be
                granted.
              </p>
              <div
                className="flex flex-col items-center justify-center bg-white border rounded cursor-pointer group aspect-1 group-hover:border-gray-300"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <div className="max-w-xs space-y-2 text-center">
                  <h3 className="text-lg font-medium">
                    Drop your recepients file here
                  </h3>
                  <p className="text-sm text-gray-600">
                    Download the template file and fill out the values in the
                    format.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {items && (
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
          <div className="space-y-2">
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
          </div>
          <Button
            loading={isConfirming}
            disabled={isConfirming}
            onClick={async (event) => {
              event.preventDefault()
              setIsConfirming(true)
              try {
                await onConfirm(list)
                clear()
                ToastHelper.success(`Successfully granted ${list.length} keys`)
              } catch (error) {
                if (error instanceof Error) {
                  ToastHelper.error(error.message)
                }
              }
              setIsConfirming(false)
            }}
          >
            Confirm aidrop
          </Button>
        </div>
      )}
    </div>
  )
}
