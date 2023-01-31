import { useEffect } from 'react'
import { Button } from '@unlock-protocol/ui'
import { addressMinify } from '~/utils/strings'
import useClipboard from 'react-use-clipboard'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'

import { useConfig } from '~/utils/withConfig'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface AddressLinkProps {
  lockAddress: string
  network: number
}

export const AddressLink = ({ lockAddress, network }: AddressLinkProps) => {
  const { networks } = useConfig()

  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Lock address copied`)
  }, [isCopied])

  const { explorer } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'

  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-dark">{addressMinify(lockAddress)}</span>
      <Button variant="borderless" onClick={setCopied}>
        <CopyIcon size={20} />
      </Button>
      <a href={explorerUrl} target="_blank" rel="noreferrer">
        <Button variant="borderless">
          <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
        </Button>
      </a>
    </div>
  )
}
