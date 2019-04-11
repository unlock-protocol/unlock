import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import {
  LogContent,
  mapStateToProps,
} from '../../../components/content/LogContent'
import * as UnlockTypes from '../../../unlockTypes'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'

jest.mock('next/router', () => {})

const transactions = {
  '0x12345678': {
    hash: '0x12345678',
    confirmations: 12,
    status: UnlockTypes.TransactionStatus.MINED,
    lock: '0x12345678a',
    blockNumber: 1,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock of Seagulls',
  },
  '0x56781234': {
    hash: '0x56781234',
    confirmations: 4,
    status: UnlockTypes.TransactionStatus.MINED,
    lock: '0x56781234a',
    blockNumber: 2,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock the Casbah',
  },
  '0x9abcdef0': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: UnlockTypes.TransactionStatus.MINED,
    lock: '0x9abcdef0a',
    blockNumber: 3,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock Robster',
  },
}

const account: UnlockTypes.Account = {
  address: '0x12345678',
  balance: '5',
}

const network: UnlockTypes.Network = {
  name: 1984,
}

const state = {
  account,
  network,
  transactions,
}

const config = {
  chainExplorerUrlBuilders: {
    etherScan: (address: string) =>
      `https://blockchain.party/address/${address}/`,
  },
}

describe('Transaction Log', () => {
  describe('mapStateToProps', () => {
    const { transactionFeed, explorerLinks } = mapStateToProps(state, {
      config,
    })

    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(4)
      expect(transactionFeed).toHaveLength(3)
      expect(transactionFeed[0].blockNumber).toEqual(3)
      expect(transactionFeed[1].blockNumber).toEqual(2)
      expect(transactionFeed[2].blockNumber).toEqual(1)
    })

    it('should include a separate feed of URLs to chain explorer for each transaction', () => {
      expect.assertions(2)
      expect(Object.keys(explorerLinks)).toHaveLength(3)
      expect(explorerLinks['0x9abcdef0']).toBe(
        'https://blockchain.party/address/0x9abcdef0a/'
      )
    })
  })

  describe('create lock button', () => {
    // TODO: We need to test that clicking this button actually does something.
    it('should have a create lock button', () => {
      expect.assertions(1)
      const showForm = jest.fn()
      const {
        account,
        network,
        transactionFeed,
        explorerLinks,
      } = mapStateToProps(state, { config })
      const ConfigProvider = ConfigContext.Provider

      const wrapper = rtl.render(
        <Provider store={createUnlockStore(state)}>
          <ConfigProvider value={config}>
            <LogContent
              account={account}
              network={network}
              transactionFeed={transactionFeed}
              explorerLinks={explorerLinks}
              showForm={showForm}
            />
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.getByText('Create Lock')).not.toBeNull()
    })
  })
})
