import React, { useState, useContext, useEffect } from 'react'
import Drawer from '../../interface/Drawer'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import { Button, Input } from '@unlock-protocol/ui'
import { useMutation, useQuery } from 'react-query'
import { useKeys } from '~/hooks/useKeys'
import { addressMinify } from '~/utils/strings'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { FaSpinner as Spinner } from 'react-icons/fa'

interface GrantKeysDrawerInterface {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  lockAddresses: string[]
}

interface ExtendKeyItem {
  lockAddress: string
  lockName: string
  tokenId: string
  owner: string
}

const ExtendKeysList = ({ items = [] }: { items: ExtendKeyItem[] }) => {
  const walletService = useWalletService()
  const disabled = items?.length === 0
  const [duration, setDuration] = useState<number>(0)

  const onDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseInt(e.target.value))
  }

  const onExtendKeys = async () => {
    if (!walletService) return

    const extendDuration = duration * 86400 // transform days in seconds
    const extendKeysPromise = items.map(({ lockAddress, tokenId }) =>
      walletService.grantKeyExtension(
        {
          lockAddress,
          tokenId,
          duration: extendDuration,
        },
        () => void 0
      )
    )
    return await Promise.all(extendKeysPromise)
  }

  const extendKeysMutation = useMutation(onExtendKeys, {
    onSuccess: () => {
      ToastHelper.success('Keys duration extended')
    },
    onError: (err: any) => {
      ToastHelper.error(err?.message || 'Error with extending keys')
    },
  })

  if (items?.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <div className="flex-flex-col">
        <fieldset>
          <Input
            type="number"
            placeholder="The duration in days to add to the keys"
            label="Extend duration (in days)"
            min={1}
            disabled={disabled}
            onChange={onDurationChange}
          />
        </fieldset>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full">
          <span className="text-sm font-medium text-gray-900">
            List of keys to extend:
          </span>
          <ul className="px-3 list-disc">
            {items?.map(({ lockName, owner }) => {
              return (
                <li key={owner}>{`${lockName} - ${addressMinify(owner)}`}</li>
              )
            })}
          </ul>
        </div>
      </div>

      <Button
        disabled={disabled || !duration || extendKeysMutation.isLoading}
        onClick={() => extendKeysMutation.mutate()}
      >
        <div className="flex items-center gap-2">
          {extendKeysMutation.isLoading && (
            <Spinner className="mr-1 animate-spin" />
          )}
          <span>{`Extend ${items?.length} keys`}</span>
        </div>
      </Button>
    </div>
  )
}

export const ExtendKeysDrawer = ({
  isOpen,
  setIsOpen,
  lockAddresses,
}: GrantKeysDrawerInterface) => {
  const { network, account } = useContext(AuthenticationContext)
  const [extenKeysList, setExtendKeyList] = useState<ExtendKeyItem[]>([])

  const { getKeys } = useKeys({
    viewer: account!,
    locks: lockAddresses,
    network: network!,
    filters: {
      query: '',
      filterKey: 'expiration',
      expiration: 'expired',
      page: 0,
    },
  })

  const { isLoading: loadingKeys, data: keys } = useQuery(
    ['expiredKeys'],
    () => getKeys(),
    {
      refetchInterval: false,
    }
  )

  const [keyId, setKeyId] = useState<any>(null)

  const handleLockChanged = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setKeyId(evt?.target.value)
  }

  const onAddItem = () => {
    if (!keyId) return
    const {
      lockAddress,
      token: tokenId,
      keyholderAddress: owner,
      lockName,
    } = keys?.find((key) => key.token === keyId) || {}

    setExtendKeyList([
      ...extenKeysList,
      {
        lockAddress,
        tokenId,
        owner,
        lockName,
      },
    ])
    setKeyId('') // reset selected keys
  }

  useEffect(() => {
    if (isOpen) return
    setExtendKeyList([])
    setKeyId('')
  }, [isOpen])

  return (
    <Drawer title="Extend Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="mb-6">
        As a lock manager you can extend an existing keys with no charge.
      </p>

      <div className="flex flex-col flex-wrap gap-2 px-3 mb-6 -mx-3">
        <label className="px-1 text-base" htmlFor="grid-lock">
          Select keys you want to extend
        </label>

        <select
          id="grid-lock"
          name="form block form-select"
          className="box-border flex-1 block w-full py-2 pl-4 text-base transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
          onChange={handleLockChanged}
          defaultValue=""
          value={keyId ? keyId : ''}
          disabled={loadingKeys}
        >
          <option value="" disabled>
            Choose Key
          </option>
          {keys?.map(({ token, keyholderAddress, lockName }: any) => {
            // disable all selected item from selection if already present in list
            const keyInList = !!extenKeysList?.find(
              ({ tokenId }) => tokenId === token
            )?.tokenId
            return (
              <option value={token} key={token} disabled={keyInList}>
                {`${lockName} - ${addressMinify(keyholderAddress)}`}
              </option>
            )
          })}
        </select>

        <Button disabled={!keyId || loadingKeys} onClick={onAddItem}>
          Add key
        </Button>

        <ExtendKeysList items={extenKeysList} />
      </div>
    </Drawer>
  )
}

export default ExtendKeysDrawer
