'use client'
import React, { useEffect } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import KeyDetails from '../interface/keychain/KeyDetails'
import { AppLayout } from '../interface/layouts/AppLayout'
import { TbWorld as WorldIcon } from 'react-icons/tb'
import { useAuth } from '~/contexts/AuthenticationContext'
import { OpenSeaIcon } from '../icons'
import { Tooltip } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import { useRouter } from 'next/router'

export const KeychainContent = () => {
  const { account } = useAuth()
  const { query } = useRouter()
  const [owner, setOwner] = React.useState<string | null>(null)

  useEffect(() => {
    if (query.owner) {
      setOwner(query.owner as string)
    } else if (account) {
      setOwner(account)
    }
  }, [account, query])

  const networkConfig = networks[1]

  return (
    <AppLayout
      authRequired={!owner}
      title={
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Member Keychain</h1>

          {networkConfig && owner && (
            <div className="flex gap-3">
              {networkConfig.blockScan && networkConfig.blockScan.url && (
                <Tooltip tip="Show Blockscan" label="Show Blockscan">
                  <a
                    href={networkConfig.blockScan.url(owner!)}
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
                    href={networkConfig.opensea!.profileUrl(owner!) ?? '#'}
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
      description="A Key is a membership NFT created on Unlock Protocol"
    >
      <Head>
        <title>{pageTitle('Member Keychain')}</title>
      </Head>
      {owner && <KeyDetails owner={owner} />}
    </AppLayout>
  )
}
export default KeychainContent
