import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import KeyDetails from '../interface/keychain/KeyDetails'
import { AppLayout } from '../interface/layouts/AppLayout'
import { TbWorld as WorldIcon } from 'react-icons/tb'
import { useAuth } from '~/contexts/AuthenticationContext'
import { OpenSeaIcon } from '../icons'
import { Tooltip } from '@unlock-protocol/ui'

export const KeychainContent = () => {
  const { account } = useAuth()
  return (
    <AppLayout
      title={
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold">Member Keychain</h1>
          <div className="flex gap-3">
            <Tooltip tip="" label="">
              <a
                href={`https://blockscan.com/address/${account}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-ui-primary"
              >
                <WorldIcon size={25} />
              </a>
            </Tooltip>

            <Tooltip tip="View Opensea Profile" label="View Opensea Profile">
              <a
                href={`https://opensea.io/${account}`}
                rel="noreferrer"
                target="_blank"
                className="hover:text-brand-ui-primary"
              >
                <OpenSeaIcon size={23} />
              </a>
            </Tooltip>
          </div>
        </div>
      }
      description="A Key is a membership NFT created on Unlock Protocol"
    >
      <Head>
        <title>{pageTitle('Member Keychain')}</title>
      </Head>
      <KeyDetails />
    </AppLayout>
  )
}
export default KeychainContent
