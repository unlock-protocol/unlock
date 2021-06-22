import React, { createContext } from 'react'
import * as rtl from '@testing-library/react'

import { TransactionType } from '../../../../unlockTypes'

import { LockIconBar } from '../../../../components/creator/lock/LockIconBar'
import { ConfigContext } from '../../../../utils/withConfig'
import { AuthenticationContext } from '../../../../components/interface/Authenticate'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    }
  },
}))

/**
 * Helper to render with some contexts
 * @param {*} component
 * @returns
 */
export const renderWithContexts = (component) => {
  const config = {
    networks: {
      1492: {
        explorer: {
          urls: {
            address: () => '',
          },
        },
      },
    },
  }
  const authentication = { network: 1492 }

  return rtl.render(
    <ConfigContext.Provider value={config}>
      <AuthenticationContext.Provider value={authentication}>
        {component}
      </AuthenticationContext.Provider>
    </ConfigContext.Provider>
  )
}

describe('LockIconBar', () => {
  let lock
  let store
  let toggleCode

  beforeEach(() => {
    lock = {
      id: 'lock',
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    toggleCode = jest.fn()
  })
})
