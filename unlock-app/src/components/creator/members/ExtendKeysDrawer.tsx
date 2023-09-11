import React from 'react'
import { Button, Drawer, Input } from '@unlock-protocol/ui'
import { useMutation } from '@tanstack/react-query'
import { addressMinify } from '~/utils/strings'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useEns from '~/hooks/useEns'
import { useForm } from 'react-hook-form'
import { MAX_UINT } from '~/constants'
import dayjs from 'dayjs'
import { useAuth } from '~/contexts/AuthenticationContext'

interface ExtendKeyDrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  selectedKey: ExtendKeyItem
  resetSearchFilters?: () => void
}

export interface ExtendKeyItem {
  lockAddress: string
  lockName: string
  tokenId: string
  owner: string
  network: number
  expiration: string
}

/**
 * https://stackoverflow.com/questions/30166338/setting-value-of-datetime-local-from-date
 * The `datetime-local` input fields takes a string in a specific format
 * so we format it for it to be used there.
 * @param date
 * @returns
 */
const formatDate = (timestamp: number) => {
  if (timestamp === -1) {
    return ''
  }
  const date = new Date(timestamp * 1000)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

interface ExtendKeyDurationProps {
  lockAddress: string
  tokenId: string
  onComplete: () => void
  currentExpiration: string
  network: number
}

const ExtendKeyDurationForm = ({
  lockAddress,
  tokenId,
  onComplete,
  currentExpiration,
  network,
}: ExtendKeyDurationProps) => {
  const { getWalletService } = useAuth()
  const defaultValues = {
    // expiration date as default
    expiration: formatDate(
      MAX_UINT === currentExpiration ? -1 : parseInt(currentExpiration)
    ),
    neverExpires: MAX_UINT === currentExpiration,
  }

  const {
    register,
    formState: { isDirty },
    setValue,
    getValues,
    trigger,
    handleSubmit,
    reset,
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  const onExtendKeys = async ({
    lockAddress,
    tokenId,
    extendDuration,
  }: {
    lockAddress: string
    tokenId: string
    extendDuration: number | string
  }) => {
    const walletService = await getWalletService(network)
    return await walletService.grantKeyExtension(
      {
        lockAddress,
        tokenId,
        duration: extendDuration as number,
      },
      {} /** TransactionParams */,
      () => void 0
    )
  }

  const extendKeyMutation = useMutation(onExtendKeys)

  const onExtendDuration = async () => {
    const isFormValid = await trigger()
    const { expiration, neverExpires } = getValues()
    if (isFormValid) {
      // the new expiration will extend the key from the current block timestamp
      const now = dayjs()
      const newExpiration = dayjs(expiration)

      let extendDuration: number | string = MAX_UINT
      if (!neverExpires) {
        if (parseInt(currentExpiration) * 1000 > new Date().getTime()) {
          const timeDiffFromExpiration = newExpiration.diff(
            new Date(parseInt(currentExpiration) * 1000),
            'second'
          )
          extendDuration = timeDiffFromExpiration
        } else {
          const timeDiffFromNow = newExpiration.diff(now, 'second')
          extendDuration = timeDiffFromNow
        }
      }

      if (typeof extendDuration === 'number' && extendDuration < 0) {
        return ToastHelper.error(`The expiration date can't be pulled back.`)
      }

      if (
        (typeof extendDuration === 'number' && extendDuration > 0) ||
        extendDuration === MAX_UINT
      ) {
        const keyMutationPromise = extendKeyMutation.mutateAsync({
          extendDuration,
          lockAddress,
          tokenId,
        })
        await ToastHelper.promise(keyMutationPromise, {
          loading: 'Extending key duration',
          success: 'Keys duration extended',
          error: 'Error with extending keys',
        })
        onComplete()
        reset(defaultValues)
      } else {
        ToastHelper.error(`Expiration date can't be in the past`)
      }
    }
  }
  const { neverExpires } = getValues()
  const loading = extendKeyMutation.isLoading

  return (
    <form
      className="flex flex-col w-full gap-3"
      onSubmit={handleSubmit(onExtendDuration)}
    >
      <Input
        type="datetime-local"
        placeholder="Key expiration date"
        label="Key expiration date"
        disabled={neverExpires || loading}
        min={new Date(parseInt(currentExpiration) * 1000)
          .toISOString()
          .slice(0, 16)}
        {...register('expiration')}
      />

      <div>
        <label htmlFor="never-expires">
          Never Expires
          <input
            id="never-expires"
            className="ml-2 align-middle"
            type="checkbox"
            disabled={loading}
            {...register('neverExpires', {
              onChange: () => {
                setValue('expiration', '')
              },
            })}
          />
        </label>
      </div>
      <Button
        disabled={!isDirty || loading}
        type="submit"
        loading={extendKeyMutation.isLoading}
      >
        {!extendKeyMutation.isLoading
          ? 'Extend key duration'
          : 'Extend key duration...'}
      </Button>
    </form>
  )
}

export const ExtendKeysDrawer = ({
  isOpen,
  setIsOpen,
  selectedKey,
  resetSearchFilters,
}: ExtendKeyDrawerProps) => {
  const owner = selectedKey?.owner
  const addressToEns = useEns(owner!)

  const {
    lockAddress,
    tokenId,
    network,
    expiration: currentExpiration,
  } = selectedKey ?? {}

  if (!lockAddress && !tokenId) return null

  const onComplete = async () => {
    setIsOpen(false)
    if (typeof resetSearchFilters === 'function') {
      resetSearchFilters()
    }
  }

  return (
    <Drawer title="Extend Key" isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="mb-6">
        As a lock manager you can extend the key expiration with no charge.
      </p>

      <div className="flex flex-col flex-wrap gap-3 px-3 mb-6 -mx-3">
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <span className="px-1 text-base font-semibold">Token:</span>
            <span>{selectedKey?.tokenId}</span>
          </div>
          <div className="flex gap-2">
            <span className="px-1 text-base font-semibold">Owner:</span>
            <span>
              {/* ens will not be minified when resolved */}
              {addressToEns === owner ? addressMinify(owner) : addressToEns}
            </span>
          </div>
        </div>
      </div>

      <ExtendKeyDurationForm
        lockAddress={lockAddress}
        tokenId={tokenId}
        onComplete={onComplete}
        currentExpiration={currentExpiration}
        network={network}
      />
    </Drawer>
  )
}

export default ExtendKeysDrawer
