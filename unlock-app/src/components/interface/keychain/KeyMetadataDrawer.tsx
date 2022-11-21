import { Disclosure, Input } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStorageService } from '~/utils/withStorageService'
import React from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { useQuery } from '@tanstack/react-query'
import { Property } from '../locks/metadata/custom/AddProperty'
import { Level } from '../locks/metadata/custom/AddLevel'
import { Stat } from '../locks/metadata/custom/AddStat'
import { Transition, Dialog } from '@headlessui/react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata, toFormData } from '../locks/metadata/utils'

interface MetadataProps {
  tokenId: string
  network: number
  lock: any
  account: string
}

interface MetadataDrawerProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  tokenId: string
  network: number
  lock: any
  account: string
}

interface MetadataPropertiesProps {
  lockAddress: string
  network: number
  isLoading: boolean
}

const Header = ({ title }: any) => {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold text-brand-ui-primary">{title}</span>
    </div>
  )
}

const Link = ({ url, label }: any) => {
  return (
    <a
      className="text- text-brand-ui-primary"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  )
}

function PublicLockProperties({
  lockAddress,
  network,
  isLoading,
}: MetadataPropertiesProps) {
  const storageService = useStorageService()
  const { data } = useQuery<Record<string, any>>(
    ['lockMetadata', lockAddress, network],
    async () => {
      const response = await storageService.locksmith.lockMetadata(
        network,
        lockAddress
      )
      return response.data
    },
    {
      onError() {
        ToastHelper.error('Impossible to retrieve public NFT metadata.')
      },
      refetchInterval: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 2,
    }
  )

  const {
    stats = [],
    levels = [],
    properties = [],
    external_url = '',
    youtube_url = '',
    animation_url = '',
  } = toFormData((data ?? {}) as Metadata)

  const hasLinks =
    external_url?.length > 0 ||
    youtube_url?.length > 0 ||
    animation_url?.length > 0

  const hasAttributes = [...stats, ...levels, ...properties].length > 0

  return (
    <div className="flex flex-col gap-6">
      {hasAttributes && (
        <div className="flex flex-col gap-4">
          {properties?.length > 0 && (
            <Disclosure label="Properties" isLoading={isLoading}>
              <div className="flex flex-wrap gap-6">
                {properties?.map((item, index) => (
                  <Property {...item} key={index} />
                ))}
              </div>
            </Disclosure>
          )}
          {levels?.length > 0 && (
            <Disclosure label="Levels" isLoading={isLoading}>
              <div className="flex flex-wrap gap-6">
                {levels?.map((item, index) => (
                  <Level {...item} key={index} />
                ))}
              </div>
            </Disclosure>
          )}
          {stats?.length > 0 && (
            <Disclosure label="Stats" isLoading={isLoading}>
              <div className="flex flex-wrap gap-6">
                {stats?.map((item, index) => (
                  <Stat {...item} key={index} />
                ))}
              </div>
            </Disclosure>
          )}
        </div>
      )}
      {hasLinks && (
        <Disclosure label="Links" isLoading={isLoading}>
          <div className="flex flex-col gap-2">
            {external_url && <Link label="External URL" url={external_url} />}
            {youtube_url && <Link label="Youtube URL" url={youtube_url} />}
            {animation_url && (
              <Link label="Animation URL" url={animation_url} />
            )}
          </div>
        </Disclosure>
      )}
    </div>
  )
}

export const KeyMetadata = ({
  tokenId,
  lock,
  network,
  account,
}: MetadataProps) => {
  const [metadata, setMetadata] = useState<{ [key: string]: any }>()
  const [loading, setLoading] = useState(false)
  const storageService = useStorageService()
  const walletService = useWalletService()
  const { register } = useForm()

  useEffect(() => {
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
        keyId: parseInt(tokenId, 10),
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
    tokenId,
    lock.address,
    lock.owner,
    network,
    storageService,
    walletService,
  ])

  const values = Object.entries(metadata ?? {})
  const hasValues = values?.length > 0

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="flex flex-col gap-3 min-h-[300px] text-left">
        <span className="text-3xl font-semibold">
          {`${lock.name} - Metadata`}{' '}
        </span>
        <Disclosure isLoading={loading} label="Key metadata">
          {hasValues ? (
            <>
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
            </>
          ) : (
            <div>There is no metadata associated with that key.</div>
          )}
        </Disclosure>
        <PublicLockProperties
          isLoading={loading}
          lockAddress={lock.address}
          network={network}
        />
        <Header />
      </div>
    </div>
  )
}

export const KeyMetadataDrawer = ({
  isOpen,
  setIsOpen,
  lock,
  tokenId,
  network,
  account,
}: MetadataDrawerProps) => {
  const easeOutTransaction = {
    as: Fragment,
    enter: 'ease-in-out duration-300',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'ease-in-out duration-300',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  }
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="absolute inset-0 overflow-y-auto">
          <Transition.Child {...easeOutTransaction}>
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-full h-screen p-6 overflow-y-auto bg-ui-secondary-100">
                <Transition.Child {...easeOutTransaction}>
                  <button
                    aria-label="close"
                    className="hover:fill-brand-ui-primary"
                    onClick={() => {
                      setIsOpen(false)
                    }}
                  >
                    <CloseIcon className="fill-inherit" size={24} />
                  </button>
                </Transition.Child>
                <div className="mt-4 space-y-2">
                  <Dialog.Title className="text-xl font-medium text-gray-800"></Dialog.Title>
                  <Dialog.Description className="text-base text-gray-800"></Dialog.Description>
                </div>
                <div className="relative flex-1">
                  <KeyMetadata
                    account={account}
                    lock={lock}
                    tokenId={tokenId}
                    network={network}
                  />
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
