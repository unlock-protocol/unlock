import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { TransactionType } from '../../../../unlockTypes'

import {
  LockIconBar,
  mapStateToProps,
} from '../../../../components/creator/lock/LockIconBar'

import createUnlockStore from '../../../../createUnlockStore'

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
    store = createUnlockStore({})
    toggleCode = jest.fn()
  })

  it('should trigger edit when clicked', () => {
    expect.assertions(2)
    const edit = jest.fn()

    const config = {
      requiredConfirmations: 10,
    }
    let wrapper = rtl.render(
      <Provider store={store}>
        <LockIconBar
          lock={lock}
          toggleCode={toggleCode}
          config={config}
          edit={edit}
        />
      </Provider>
    )

    rtl.fireEvent.click(wrapper.getByTitle('Edit'))

    expect(edit).toHaveBeenCalledTimes(1)
    expect(edit).toHaveBeenCalledWith(lock.address)
  })

  describe('mapStateToProps', () => {
    const lock = {
      address: '0xlock',
    }

    it('should return lockCreationTransaction, withdrawalTransaction and priceUpdateTransaction', () => {
      expect.assertions(3)
      const transactions = {
        '0xlockCreation': {
          hash: '0xlockCreation',
          lock: '0xlock',
          type: TransactionType.LOCK_CREATION,
        },
        '0xlockPriceUpdate': {
          hash: '0xlockPriceUpdate',
          to: '0xlock',
          type: TransactionType.UPDATE_KEY_PRICE,
        },
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.lockCreationTransaction.hash).toBe('0xlockCreation')
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
      expect(props.priceUpdateTransaction.hash).toBe('0xlockPriceUpdate')
    })

    it('should return only transactions which are not full confirmed', () => {
      expect.assertions(3)
      const transactions = {
        '0xlockCreation': {
          hash: '0xlockCreation',
          lock: '0xlock',
          type: TransactionType.LOCK_CREATION,
          confirmations: 100,
        },
        '0xlockPriceUpdate': {
          hash: '0xlockPriceUpdate',
          to: '0xlock',
          type: TransactionType.UPDATE_KEY_PRICE,
        },
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.lockCreationTransaction).toBe(undefined)
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
      expect(props.priceUpdateTransaction.hash).toBe('0xlockPriceUpdate')
    })

    it('should return only transactions which are for the lock being displayed', () => {
      expect.assertions(3)
      const transactions = {
        '0xlockCreation': {
          hash: '0xlockCreation',
          lock: '0xlock',
          type: TransactionType.LOCK_CREATION,
        },
        '0xlockPriceUpdate': {
          hash: '0xlockPriceUpdate',
          to: '0xanotherLock',
          type: TransactionType.UPDATE_KEY_PRICE,
        },
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.lockCreationTransaction.hash).toBe('0xlockCreation')
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
      expect(props.priceUpdateTransaction).toBe(undefined)
    })

    it('should return only the most recent transaction if there are 2 of a kind', () => {
      expect.assertions(3)
      const transactions = {
        '0xlockCreation': {
          hash: '0xlockCreation',
          lock: '0xlock',
          type: TransactionType.LOCK_CREATION,
        },
        '0xlockPriceUpdate': {
          blockNumber: 100,
          hash: '0xlockPriceUpdate',
          to: '0xlock',
          type: TransactionType.UPDATE_KEY_PRICE,
        },
        '0xlockPriceUpdate2': {
          blockNumber: 101,
          hash: '0xlockPriceUpdate2',
          to: '0xlock',
          type: TransactionType.UPDATE_KEY_PRICE,
        },
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.lockCreationTransaction.hash).toBe('0xlockCreation')
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
      expect(props.priceUpdateTransaction.hash).toBe('0xlockPriceUpdate2')
    })
  })
})
