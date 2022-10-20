import { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Lock, PaywallConfigLock, PaywallConfigLockSchema } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { DynamicForm } from './DynamicForm'
import { z } from 'zod'
import { Button, IconButton, Select } from '@unlock-protocol/ui'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { addressMinify } from '~/utils/strings'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'

const LockSchema = PaywallConfigLockSchema.omit({
  network: true, // network will managed with a custom input with the lock address
})

type PartialLockSchemaProps = z.infer<typeof LockSchema>
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

  const onSubmit = (fields: PartialLockSchemaProps) => {
    const defaultLockName = locksByNetwork?.find(
      (lock) => lock.address?.toLowerCase() === lockAddress?.toLowerCase()
    )?.name

    // set default name if none is set
    if (!fields.name) {
      fields.name = defaultLockName
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

  return (
    <>
      <LockList />
      {addLock && (
        <>
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
              onChange={(value: string | number) => {
                setLockAddress(`${value}`)
              }}
            />
          </div>
          {hasMinValue && (
            <DynamicForm
              title="Settings"
              name={'locks'}
              schema={LockSchema}
              onChange={() => void 0}
              onSubmit={onSubmit}
              submitLabel={'Add lock'}
              showSubmit={true}
            />
          )}
        </>
      )}
    </>
  )
}

const LockListItem = ({ address, name, onRemove }: LockListItemProps) => {
  return (
    <div className="flex items-center justify-between w-full px-2 py-1 text-sm bg-white rounded-lg shadow">
      <div className="flex items-center w-full">
        <div className="flex items-center gap-2">
          <LockImage lockAddress={address} />
          <span className="text-base font-semibold">{name}</span>
        </div>
        <span className="ml-auto">{addressMinify(address)}</span>
      </div>
      <IconButton
        onClick={onRemove}
        icon={<CloseIcon size={20} className="hover:fill-inherit" />}
        label="Close"
      />
    </div>
  )
}
