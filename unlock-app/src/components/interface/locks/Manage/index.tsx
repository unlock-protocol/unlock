import { Button, Drawer, Input } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { FiKey as KeyIcon } from 'react-icons/fi'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { BiLink as LinkIcon } from 'react-icons/bi'
import { HiOutlineShare as ShareOptionIcon } from 'react-icons/hi'
import { useForm } from 'react-hook-form'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'

interface ActionBarProps {
  lockAddress: string
}

const ActionBar = ({ lockAddress }: ActionBarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { network } = useAuth()

  return (
    <>
      <AirdropKeysDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lockAddress={lockAddress}
        network={network!}
      />
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-brand-ui-primary">Members</span>
        <div className="flex gap-2">
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <KeyIcon className="text-brand-ui-primary" size={16} />
              <span className="text-brand-ui-primary">Airdrop Keys</span>
            </div>
          </Button>
        </div>
      </div>
    </>
  )
}

const TopActionBar = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    getValues,
    formState: { isValid, errors },
    resetField,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      url: '',
    },
  })

  const { url } = getValues()
  const [isCopied, setCopied] = useClipboard(url, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`URL copied`)
  }, [isCopied])

  return (
    <>
      <Drawer
        title="Generate Purchase URL"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="flex flex-col h-full gap-10">
          <span className="text-base">
            Generate an URL that you can share with your fans and allow them to
            easily purchase this membership
          </span>
          <div>
            <form>
              <Input
                placeholder="https://example.com"
                type="url"
                {...register('url', {
                  required: true,
                })}
              />
            </form>
            <span className="text-xs leading-none">
              Enter the URL to which your members are redirected when they have
              a membership
            </span>
            {errors?.url && (
              <span className="block mt-2 text-xs text-red-700">
                Please enter a valid URL
              </span>
            )}
          </div>
          <Button
            variant="outlined-primary"
            disabled={!isValid}
            onClick={setCopied}
          >
            <div className="flex items-center gap-2 text-brand-ui-primary">
              <span className="text-base">Share link</span>
              <ShareOptionIcon size={20} />
            </div>
          </Button>
          <Button
            variant="transparent"
            className="w-full mt-auto"
            onClick={() => resetField('url')}
          >
            Reset
          </Button>
        </div>
      </Drawer>
      <div className="flex items-center justify-between">
        <Button variant="transparent" className="p-0" aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </Button>
        <Button className="p-3 md:px-6" onClick={() => setIsOpen(true)}>
          <div className="flex items-center gap-2">
            <LinkIcon size={15} />
            <span className="hidden md:block">Generate URL</span>
          </div>
        </Button>
      </div>
    </>
  )
}

export const ManageLockPage = () => {
  const { network: walletNetwork } = useAuth()
  const { query } = useRouter()

  const { address, network } = query ?? {}

  if (!walletNetwork) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  const lockNetwork = parseInt(network as string)
  const lockAddress = address as string

  return (
    <div className="min-h-screen bg-ui-secondary-200 pb-60">
      <div className="w-full px-4 lg:px-40">
        <div className="px-4 mx-auto lg:container pt-9">
          <div className="mb-7">
            <TopActionBar />
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-3">
              <LockDetailCard lockAddress={lockAddress} network={lockNetwork} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-9">
              <TotalBar lockAddress={lockAddress} network={lockNetwork} />
              <ActionBar lockAddress={lockAddress} />
              <Members lockAddress={lockAddress} network={lockNetwork} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageLockPage
