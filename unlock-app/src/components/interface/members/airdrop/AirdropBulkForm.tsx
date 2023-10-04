import { Button, Placeholder, minifyAddress } from '@unlock-protocol/ui'
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
import { KeyManager } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'

const MAX_SIZE = 50

interface Props {
  lock: Lock
  onConfirm(members: AirdropMember[]): void | Promise<void>
  emailRequired?: boolean
}

export function AirdropBulkForm({ lock, onConfirm, emailRequired }: Props) {
  const [list, { set, clear, removeAt }] = useList<AirdropMember>([])
  const [error, setError] = useState('')
  const config = useConfig()
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
      try {
        const text = await file.text()
        const discarded = []
        const json: any[] =
          parse(text, {
            delimiter: [',', ';'],
            columns: true,
            skip_empty_lines: true,
          }) || []

        const linesWithError: number[] = []
        const duplicates: AirdropMember[] = []
        const missingEmail: AirdropMember[] = []

        const members = await Promise.all(
          json.map(async (item, line) => {
            try {
              if (!item.wallet && item.email) {
                // If no recipient is provided but email is, we create a transfer address for walletless users
                const keyManager = new KeyManager(config.networks)
                const networkConfig = config.networks[lock.network]
                const wallet = keyManager.createTransferAddress({
                  params: {
                    lockAddress: lock.address,
                    email: item.email,
                  },
                })
                item.manager = networkConfig.keyManagerAddress
                item.wallet = wallet
              }
              const record = AirdropMember.parse(item)

              // If there is any record in the expiration column, we should assume that this is the expiration date
              if (record.expiration) {
                record.neverExpire = false
              }

              const [wallet, manager] = await Promise.all([
                getAddressForName(record.wallet),
                getAddressForName(record.manager || account!),
              ])

              // Deduplicate by looking at existing keys
              const balance = await web3Service.totalKeys(
                lock.address,
                wallet,
                lock.network
              )

              return {
                ...record,
                wallet,
                manager,
                balance,
                line: line + 2,
              }
            } catch (error) {
              linesWithError.push(line + 2) // index starts at 0, lines at 1 and we have the header row
              console.error(`Failed to add `, item, error)
              return
            }
          })
        )

        const filteredMembers = members
          .reduce<AirdropMember[]>((filtered, member) => {
            // filter null or undefined values
            if (!member) {
              return filtered
            }

            // find existing members
            const existingMembers = filtered.filter(
              ({ wallet }) => wallet === member.wallet
            )

            const noEmail = !member?.email?.includes('@')
            const existingBalance = member.balance || 0
            const alreadyToBeAdded = existingMembers.reduce(
              (total, existingMember) => total + existingMember.count,
              0
            )
            const toBeAdded = member.count
            if (
              existingBalance + alreadyToBeAdded + toBeAdded >
              (lock.maxKeysPerAddress || 1)
            ) {
              console.warn(`Discarded duplicate`, member)
              duplicates.push(member)
              discarded.push(member)
              return filtered
            }

            if (noEmail && emailRequired) {
              console.warn(`Email required and missing`, member)
              missingEmail.push(member)
              return filtered
            }
            // push the item to array if new unique member found
            filtered.push(member)
            return filtered
          }, [])
          .slice(0, MAX_SIZE)

        // Notify how many loaded and discarded.
        ToastHelper.success(
          `Loaded ${filteredMembers.length} members. ${discarded.length} members discarded.`
        )
        const errors: string[] = []
        if (linesWithError.length > 0) {
          errors.push(
            `The following lines had errors in your CSV file and could not be imported: ${linesWithError.join(
              ', '
            )}.`
          )
        }
        if (duplicates.length > 0) {
          errors.push(
            `The following recipients are duplicates and have been discarded: ${duplicates
              .map(
                (m) =>
                  `${minifyAddress(m.wallet)} - ${m.email} (line ${m.line})`
              )
              .join(', ')}`
          )
        }

        if (missingEmail.length > 0) {
          errors.push(
            `The following recipients are missing a required email address and have been discarded: ${missingEmail
              .map((m) => `${minifyAddress(m.wallet)} -  (line ${m.line})`)
              .join(', ')}`
          )
        }
        if (errors.length > 0) {
          setError(errors.join('\n\n'))
        }
        setIsLoadingMembers(false)
        set(filteredMembers)
      } catch (error) {
        setIsLoadingMembers(false)
        set([])
        ToastHelper.error(
          'There was an error parsing your CSV file. Please make sure you use the right format.'
        )

        console.error(error)
      }
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
                <Placeholder.Line size="md" key={index} />
              ))}
            </div>
          )}
          {!isLoadingMembers && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p>
                  Once you upload the csv, you can see all the list of
                  memberships to be granted.
                </p>
                <p>
                  Due to block size limit, you can only airdrop at most{' '}
                  {MAX_SIZE} NFT at once, but you can re-upload the same file
                  multiple times and the duplicates will automatically
                  discarded.
                </p>
                <p>
                  If you don&apos;t have wallet address of the user, leave the
                  field blank and fill out their email. We will airdrop the NFT
                  to their email.
                </p>
                <div>
                  <a
                    href="/templates/airdrop.csv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-ui-primary"
                  >
                    Download .CSV template
                  </a>
                </div>
              </div>

              <div
                className="flex flex-col items-center justify-center bg-white border rounded cursor-pointer group aspect-1 group-hover:border-gray-300"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <div className="max-w-xs space-y-2 text-center">
                  <h3 className="text-lg font-medium">
                    Drop your CSV file here
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
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  )
}
