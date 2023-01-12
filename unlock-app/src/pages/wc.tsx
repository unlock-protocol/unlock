import React, { useEffect, useState } from 'react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'

import { useRouter } from 'next/router'
import { Input } from '@unlock-protocol/ui'
import useWalletConnectClient from '~/hooks/useWalletConnectClient'
import Loading from '~/components/interface/Loading'

const Wc: NextPage = () => {
  const { query } = useRouter()
  const [formUri, setFormUri] = useState('')
  const { connect, dapp, accept, connected } = useWalletConnectClient()

  useEffect(() => {
    if (query.uri) {
      connect(`${query.uri}`)
    }
  }, [query.uri])

  return (
    <BrowserOnly>
      <AppLayout authRequired={true} showHeader={true}>
        {!dapp && !query.uri && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <Input
              value={formUri}
              name="uri"
              label="WalletConnect URI"
              type="text"
              placeholder="Enter WalletConnect URI"
              onChange={(evt) => {
                setFormUri(evt.target.value)
              }}
            />

            <button
              onClick={() => connect(formUri)}
              className="rounded-full flex justify-center cursor-pointer font-semibold items-center gap-2 disabled:bg-opacity-75 disabled:cursor-not-allowed px-6 py-2.5 text-base bg-brand-ui-primary transition ease-in-out duration-300 hover:bg-brand-dark text-white disabled:hover:bg-brand-ui-primary disabled:hover:bg-opacity-75"
            >
              Connect
            </button>
          </div>
        )}
        {!dapp && query.uri && <Loading />}
        {dapp && !connected && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <p>
              {dapp && dapp.icons && dapp.icons[0] && (
                <img alt={dapp.name} src={dapp.icons[0]} />
              )}
              <a
                href={dapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline mr-1"
              >
                <span>{dapp.name}</span> <ExternalLinkIcon className="inline" />
              </a>{' '}
              wants to know your wallet address.
            </p>
            <button
              onClick={() => accept()}
              className="rounded-full flex justify-center cursor-pointer font-semibold items-center gap-2 disabled:bg-opacity-75 disabled:cursor-not-allowed px-6 py-2.5 text-base bg-brand-ui-primary transition ease-in-out duration-300 hover:bg-brand-dark text-white disabled:hover:bg-brand-ui-primary disabled:hover:bg-opacity-75"
            >
              Connect
            </button>
          </div>
        )}
        {dapp && connected && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <p>
              {dapp && dapp.icons && dapp.icons[0] && (
                <img alt={dapp.name} src={dapp.icons[0]} />
              )}
              You are now connected to{' '}
              <a
                href={dapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                <span>{dapp.name}</span> <ExternalLinkIcon className="inline" />
              </a>
              .
            </p>
          </div>
        )}
      </AppLayout>
    </BrowserOnly>
  )
}

export default Wc
