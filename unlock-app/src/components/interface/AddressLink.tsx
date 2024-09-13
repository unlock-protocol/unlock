import { useEffect } from 'react'
import { Button } from '@unlock-protocol/ui'
import { addressMinify } from '~/utils/strings'
import useClipboard from 'react-use-clipboard'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'

import { useConfig } from '~/utils/withConfig'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface AddressLinkProps {
  address: string
  network: number
}

export const AddressLink = ({ address, network }: AddressLinkProps) => {
  const [isCopied, setCopied] = useClipboard(address, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Lock address copied')
  }, [isCopied])

  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-dark">{addressMinify(address)}</span>
      <Button variant="borderless" onClick={setCopied}>
        <CopyIcon size={20} />
      </Button>
      <ExplorerLink address={address} network={network} />
    </div>
  )
}

export const ExplorerLink = ({ address, network }: AddressLinkProps) => {
  const { networks } = useConfig()

  const { explorer } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(address) || '#'

  return (
    <a href={explorerUrl} target="_blank" rel="noreferrer">
      <Button variant="borderless">
        <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
      </Button>
    </a>
  )
}
