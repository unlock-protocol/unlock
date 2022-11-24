import React, { useState } from 'react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'

import { useAuth } from '~/contexts/AuthenticationContext'
import { useRouter } from 'next/router'
import { Input } from '@unlock-protocol/ui'
import useWalletConnectClient from '~/hooks/useWalletConnectClient'

const Wc: NextPage = () => {
  const { account, network, ...rest } = useAuth()
  const { query } = useRouter()
  const [formUri, setFormUri] = useState('')
  const uri = (formUri || query.uri)?.toString()
  const { connect, peerMeta, accept, connected } = useWalletConnectClient(
    account,
    network
  )

  return (
    <BrowserOnly>
      <AppLayout authRequired={false} showHeader={true}>
        {!peerMeta && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <Input
              value={uri}
              name="uri"
              label="WalletConnect URI"
              type="text"
              placeholder="Enter WalletConnect URI"
              onChange={(evt) => {
                setFormUri(evt.target.value)
              }}
            />

            <button
              onClick={() => connect(`${uri}`)}
              className="rounded-full flex justify-center cursor-pointer font-semibold items-center gap-2 disabled:bg-opacity-75 disabled:cursor-not-allowed px-6 py-2.5 text-base bg-brand-ui-primary transition ease-in-out duration-300 hover:bg-brand-dark text-white disabled:hover:bg-brand-ui-primary disabled:hover:bg-opacity-75"
            >
              Connect
            </button>
          </div>
        )}
        {peerMeta && !connected && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <p>
              {peerMeta && peerMeta.icons && peerMeta.icons[0] && (
                <img alt={peerMeta.name} src={peerMeta.icons[0]} />
              )}
              <a
                href={peerMeta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                <span>{peerMeta.name}</span>{' '}
                <ExternalLinkIcon className="inline" />
              </a>
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
        {peerMeta && connected && (
          <div className="flex flex-col w-9/12 mx-auto gap-4 mt-5">
            <p>
              {peerMeta && peerMeta.icons && peerMeta.icons[0] && (
                <img alt={peerMeta.name} src={peerMeta.icons[0]} />
              )}
              You are now connected to{' '}
              <a
                href={peerMeta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                <span>{peerMeta.name}</span>{' '}
                <ExternalLinkIcon className="inline" />
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
