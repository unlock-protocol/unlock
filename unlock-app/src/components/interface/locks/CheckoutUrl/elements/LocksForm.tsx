import { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import {
  Lock,
  MetadataInput,
  MetadataInputSchema,
  PaywallConfigLock,
  PaywallConfigLockSchema,
} from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { DynamicForm } from './DynamicForm'
import { Button, IconButton, Select, Tooltip } from '@unlock-protocol/ui'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { addressMinify } from '~/utils/strings'
import { FiDelete as DeleteIcon } from 'react-icons/fi'

const LockSchema = PaywallConfigLockSchema.omit({
  network: true, // network will managed with a custom input with the lock address
})

interface LockListItemProps {
  address: string
  network: string | number
  name?: string
  onRemove?: () => void
}

type LocksProps = Record<string, PaywallConfigLock>

interface LocksFormProps {
  onChange: (locks: LocksProps) => void
  locks: LocksProps
}

interface LockImageProps {
  lockAddress: string
}
interface MetadataDetailProps {
  title: string
  value?: string
}

const LockImage = ({ lockAddress }: LockImageProps) => {
  const config = useConfig()
  const lockImage = `${config.services.storage.host}/lock/${lockAddress}/icon`

  return (
    <div className="flex items-center justify-center w-8 h-8 overflow-hidden bg-gray-200 rounded-full">
      <img
        src={lockImage}
        alt={lockAddress}
        className="object-cover w-full h-full bg-center"
      />
    </div>
  )
}

const MetadataDetail = ({ title, value }: MetadataDetailProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{title}</span>
      <span className="text-base font-bold">{value || '-'}</span>
    </div>
  )
}

export const LocksForm = ({
  onChange,
  locks: locksDefault = {},
}: LocksFormProps) => {
  const { networks } = useConfig()
  const { account } = useAuth()
  const [network, setNetwork] = useState<string | number>()
  const [lockAddress, setLockAddress] = useState<string>('')
  const [locksByNetwork, setLocksByNetwork] = useState<any[]>([])
  const [addLock, setAddLock] = useState(false)

  const [locks, setLocks] = useState<LocksProps>(locksDefault)

  const reset = () => {
    setLockAddress('')
    setNetwork(undefined)
    setAddLock(false)
  }

  const onSubmit = () => {
    reset()
  }

  useEffect(() => {
    const getLocksByNetwork = async () => {
      if (!network) return null
      const service = new SubgraphService()
      setLocksByNetwork(
        (await service.locks(
          {
            first: 1000,
            where: {
              lockManagers_contains: [account!],
            },
          },
          {
            networks: [`${network!}`],
          }
        )) ?? []
      )
    }
    getLocksByNetwork()
  }, [account, network])

  const networksOptions = Object.entries(networks).map(
    ([id, { name: label }]: [string, any]) => ({
      label,
      value: id,
    })
  )

  const onRemoveFromList = (lockAddress: string) => {
    let newObj = {}

    Object.entries(locks)
      .filter(([address]) => address.toLowerCase() !== lockAddress)
      .map(([lockAddress, fields]) => {
        newObj = {
          ...newObj,
          [lockAddress]: {
            ...fields,
          },
        }
      })

    setLocks(newObj)
    onChange(newObj)
  }

  const locksOptions: any = locksByNetwork?.map(({ address, name }: Lock) => {
    const disabled = Object.keys(locks)?.find(
      (lockAddress: string) =>
        lockAddress?.toLowerCase() === address?.toLowerCase()
    )
    return {
      prepend: <LockImage lockAddress={address} />,
      label: `${name}`,
      value: address,
      append: addressMinify(address),
      disabled,
    }
  })

  const hasMinValue = network && lockAddress && lockAddress?.length > 0

  const MetadataList = () => {
    return (
      <div>
        {(locks[lockAddress]?.metadataInputs ?? [])?.length > 0 && (
          <h3 className="mb-2 text-lg font-bold text-brand-ui-primary">
            Metadata
          </h3>
        )}
        <div className="flex flex-col gap-3">
          {locks[lockAddress]?.metadataInputs?.map((metadata, index) => {
            return (
              <>
                <div
                  key={index}
                  className="flex items-center justify-between w-full p-4 text-sm bg-white rounded-lg shadow"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="grid w-full grid-cols-3">
                      <MetadataDetail
                        title="Form label"
                        value={metadata?.name}
                      />
                      <MetadataDetail
                        title="Default value"
                        value={metadata?.defaultValue}
                      />
                      <MetadataDetail
                        title="Required"
                        value={metadata?.required ? 'YES' : 'NO'}
                      />
                    </div>
                    <IconButton
                      onClick={() => onRemoveMetadata(metadata?.name)}
                      icon={
                        <DeleteIcon size={20} className="hover:fill-inherit" />
                      }
                      label="Delete"
                    />
                  </div>
                </div>
              </>
            )
          })}
        </div>
      </div>
    )
  }

  const LockList = () => {
    return (
      <div className="flex flex-col gap-4">
        {Object.entries(locks ?? {})?.map(
          ([address, values]: [string, PaywallConfigLock]) => {
            return (
              <LockListItem
                key={address}
                name={values.name}
                address={address}
                network={values!.network!}
                onRemove={() => onRemoveFromList(address)}
              />
            )
          }
        )}
        <div className="flex gap-2">
          {!addLock && (
            <Button
              className="w-full"
              size="small"
              variant="outlined-primary"
              onClick={() => setAddLock(true)}
            >
              Add more Lock
            </Button>
          )}
        </div>
      </div>
    )
  }

  const onAddLock = (
    lockAddress: string,
    network?: number | string,
    fields: any = null
  ) => {
    const defaultLockName = locksByNetwork?.find(
      (lock) => lock.address?.toLowerCase() === lockAddress?.toLowerCase()
    )?.name

    // set default name if none is set
    if (!fields && !fields?.name) {
      fields = {
        ...fields,
        name: defaultLockName,
      }
    }

    const locksByAddress = {
      ...locks,
      [lockAddress]: {
        network: parseInt(`${network}`),
        ...fields,
      },
    }
    setLocks(locksByAddress)
    onChange(locksByAddress)
    setAddMetadata(false)
  }

  const onAddMetadata = (fields: MetadataInput) => {
    const lock = locks[lockAddress]
    const metadata = lock?.metadataInputs || []

    // update metadata by lock address
    const lockWithMetadata = {
      ...locks,
      [lockAddress]: {
        ...lock,
        metadataInputs: [...metadata, fields],
      },
    }

    setLocks(lockWithMetadata)
    onChange(lockWithMetadata)
    setAddMetadata(false)
  }

  const onRemoveMetadata = (fieldName: string) => {
    const lock = locks[lockAddress]
    const metadata =
      lock?.metadataInputs?.filter(
        (metadata) => metadata?.name?.toLowerCase() !== fieldName?.toLowerCase()
      ) ?? []

    // update metadata by lock address
    const lockWithMetadata = {
      ...locks,
      [lockAddress]: {
        ...lock,
        metadataInputs: [...metadata],
      },
    }

    setLocks(lockWithMetadata)
    onChange(lockWithMetadata)
  }
  const hasLocks =
    Object.keys(locks ?? {}).length > 0 && !lockAddress && !network
  const showForm = !hasLocks || addLock

  const [addMetadata, setAddMetadata] = useState(false)

  return (
    <>
      {!showForm && <LockList />}
      {showForm && (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
              Select a lock
            </h2>
            <div className="flex flex-col w-full gap-4">
              <Select
                label="Network"
                options={networksOptions}
                size="small"
                defaultValue={network}
                onChange={setNetwork}
              />

              <Select
                label="Lock"
                options={locksOptions}
                size="small"
                onChange={(lockAddress: any) => {
                  setLockAddress(`${lockAddress}`)
                  onAddLock(lockAddress, network!)
                }}
              />
            </div>
          </div>
          {hasMinValue && (
            <>
              {!addMetadata ? (
                <div className="flex flex-col -mt-2">
                  <MetadataList />
                  <div className="ml-auto">
                    <Button
                      variant="outlined-primary"
                      size="small"
                      onClick={() => setAddMetadata(true)}
                      className="mt-4"
                    >
                      Add metadata
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid items-center grid-cols-1 gap-2 p-4 -mt-4 bg-white rounded-xl">
                  <DynamicForm
                    title="Metadata"
                    name={'locks'}
                    schema={MetadataInputSchema}
                    onChange={() => void 0}
                    onSubmit={onAddMetadata}
                    submitLabel={'Add metadata'}
                    showSubmit={true}
                  />
                </div>
              )}
              <DynamicForm
                title="Settings"
                name={'locks'}
                schema={LockSchema.omit({
                  metadataInputs: true,
                })}
                onChange={(fields: any) =>
                  onAddLock(lockAddress, network, fields)
                }
                onSubmit={onSubmit}
                submitLabel={'Add lock'}
                showSubmit={true}
              />
            </>
          )}
        </div>
      )}
    </>
  )
}

const LockListItem = ({ address, name, onRemove }: LockListItemProps) => {
  return (
    <div className="flex items-center justify-between w-full gap-2 px-2 py-1 text-sm bg-white rounded-lg shadow">
      <div className="flex items-center w-full">
        <div className="flex items-center gap-2">
          <LockImage lockAddress={address} />
          <span className="text-base font-semibold">{name || 'Default'}</span>
        </div>
        <span className="ml-auto">{addressMinify(address)}</span>
      </div>
      <div>
        <Tooltip label="Delete" tip="Delete" side="right">
          <IconButton
            onClick={onRemove}
            icon={<DeleteIcon size={20} className="hover:fill-inherit" />}
            label="Delete"
            className="mt-1"
          />
        </Tooltip>
      </div>
    </div>
  )
}
