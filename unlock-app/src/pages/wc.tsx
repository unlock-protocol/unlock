import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import LegacySignClient from '@walletconnect/client'

import { useAuth } from '~/contexts/AuthenticationContext'
import { useRouter } from 'next/router'

/**
 * We need to show the Unlock account login form
 * and then load based on the what is in the query string!
 *
 * @returns
 */

const Wc: NextPage = () => {
  const { account, ...rest } = useAuth()
  const { query } = useRouter()
  const [uri, setUri] = useState('')

  const connect = () => {
    console.log('connecting to ', uri, account)
    if (uri) {
      const legacySignClient = new LegacySignClient({ uri })

      legacySignClient.on('session_request', (error, payload) => {
        console.log('session_request', { payload })
        // yay! Connect the user now!
        legacySignClient.approveSession({
          accounts: ['0xF5C28ce24Acf47849988f147d5C75787c0103534'],
          chainId: 1,
        })
      })

      legacySignClient.on('connect', () => {
        console.log('legacySignClient > connect')
      })

      legacySignClient.on('error', (error) => {
        throw new Error(`legacySignClient > on error: ${error}`)
      })

      legacySignClient.on('call_request', (error, payload) => {
        if (error) {
          throw new Error(`legacySignClient > call_request failed: ${error}`)
        }
        console.log('call_request', { payload })
        console.log(legacySignClient)
        if (payload.method === 'wallet_switchEthereumChain') {
          console.log('good!')

          return legacySignClient.approveRequest({
            id: payload.id,
            jsonrpc: '2.0',
            result: null,
          })
        }
        console.log(payload)
        // {
        //   "id":1,
        //   "jsonrpc": "2.0",
        //   "result": "0x0234c8a3397aab58" // 158972490234375000
        // }
      })

      legacySignClient.on('disconnect', async () => {
        console.log('legacySignClient > disconnect')
      })
    }
  }

  return (
    <BrowserOnly>
      <AppLayout authRequired={false} showHeader={true}>
        {account}
        <input
          className="ml-2 align-middle"
          type="text"
          onChange={(evt) => {
            setUri(evt.target.value)
          }}
        ></input>
        <button
          className="font-medium text-gray-600 hover:text-black"
          onClick={connect}
        >
          Connect
        </button>
      </AppLayout>
    </BrowserOnly>
  )
}

export default Wc
