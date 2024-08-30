'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import KeyDetails from '../interface/keychain/KeyDetails'
import { AppLayout } from '../interface/layouts/AppLayout'
import { TbWorld as WorldIcon } from 'react-icons/tb'
import { useAuth } from '~/contexts/AuthenticationContext'
import { OpenSeaIcon } from '../icons'
import { Tooltip } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import OwnerSocials from '../interface/keychain/OwnerSocials'

export const KeychainContent = () => {
  const { account } = useAuth()
  const searchParams = useSearchParams()
  const [owner, setOwner] = useState<string | null>(null)

  useEffect(() => {
    const ownerParam = searchParams.get('owner')
    if (ownerParam) {
      setOwner(ownerParam)
    } else if (account) {
      setOwner(account)
    }
  }, [account, searchParams])

  const networkConfig = networks[1]

  return (
    <AppLayout
      authRequired={!owner}
      title={
        <div className="flex justify-between gap-8">
          {owner && <OwnerSocials owner={owner} />}
          {networkConfig && owner && (
            <div className="flex gap-3">
              {networkConfig.blockScan && networkConfig.blockScan.url && (
                <Tooltip tip="Show Blockscan" label="Show Blockscan">
                  <a
                    href={networkConfig.blockScan.url(owner)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-ui-primary"
                  >
                    <WorldIcon size={25} />
                  </a>
                </Tooltip>
              )}

              {networkConfig.opensea && networkConfig.opensea.profileUrl && (
                <Tooltip
                  tip="View Opensea Profile"
                  label="View Opensea Profile"
                >
                  <a
                    href={networkConfig.opensea.profileUrl(owner) ?? '#'}
                    rel="noreferrer"
                    target="_blank"
                    className="hover:text-brand-ui-primary"
                  >
                    <OpenSeaIcon size={23} />
                  </a>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      }
    >
      {owner && <KeyDetails owner={owner} />}
    </AppLayout>
  )
}

export default KeychainContent
