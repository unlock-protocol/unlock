import React from 'react'
import * as rtl from '@testing-library/react'
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
      chainExplorerUrlBuilders: {
        etherscan: path => path,
      },
    }
    const wrapper = rtl.render(
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

    it('should return withdrawalTransaction', () => {
      expect.assertions(1)
      const transactions = {
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
    })

    it('should return only transactions which are not full confirmed', () => {
      expect.assertions(1)
      const transactions = {
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
    })

    it('should return only transactions which are for the lock being displayed', () => {
      expect.assertions(1)
      const transactions = {
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal')
    })

    it('should return only the most recent transaction if there are 2 of a kind', () => {
      expect.assertions(1)
      const transactions = {
        '0xlockWithdrawal': {
          hash: '0xlockWithdrawal',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
        '0xlockWithdrawal2': {
          hash: '0xlockWithdrawal2',
          to: '0xlock',
          type: TransactionType.WITHDRAWAL,
        },
      }
      const props = mapStateToProps({ transactions }, { lock })
      expect(props.withdrawalTransaction.hash).toBe('0xlockWithdrawal2')
    })
  })
})
