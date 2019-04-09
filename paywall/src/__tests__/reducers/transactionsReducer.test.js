import reducer, { initialState } from '../../reducers/transactionsReducer'
import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  NEW_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../../actions/transaction'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('transaction reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(initialState).toEqual({})
  })

  it('should return the initial state when receiving SET_PROVIDER', () => {
    expect.assertions(1)
    const transaction = {
      status: 'pending',
      confirmations: 0,
      hash: '0x123',
    }

    expect(
      reducer(
        {
          [transaction.hash]: transaction,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toBe(initialState)
  })

  it('should return the initial state when receiving SET_NETWORK', () => {
    expect.assertions(1)
    const transaction = {
      status: 'pending',
      confirmations: 0,
      hash: '0x123',
    }

    expect(
      reducer(
        {
          [transaction.hash]: transaction,
        },
        {
          type: SET_NETWORK,
        }
      )
    ).toBe(initialState)
  })

  // Upon changing account, we need to clear the existing transaction. The web3 middleware will
  // re-populate them
  it('should clear the transactions when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    const account = {}
    const transaction = {
      status: 'pending',
      confirmations: 0,
      hash: '0x123',
    }
    const state = {
      [transaction.id]: transaction,
    }
    expect(
      reducer(state, {
        type: SET_ACCOUNT,
        account,
      })
    ).toBe(initialState)
  })

  describe('when receiving NEW_TRANSACTION', () => {
    it('should add the new transaction to the store', () => {
      expect.assertions(1)
      const transaction = {
        hash: '0x123',
        sender: '0xabc',
        receipient: '0xdef',
      }

      expect(
        reducer(
          {},
          {
            type: NEW_TRANSACTION,
            transaction,
          }
        )
      ).toEqual({
        '0x123': transaction,
      })
    })
  })

  describe('when receiving ADD_TRANSACTION', () => {
    it('should set the transaction accordingly if it has not been previously added', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      expect(
        reducer(
          {},
          {
            type: ADD_TRANSACTION,
            transaction,
          }
        )
      ).toEqual({
        '0x123': transaction,
      })
    })

    it('should update an existing transaction', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      expect(
        reducer(
          {
            '0x123': transaction,
          },
          {
            type: ADD_TRANSACTION,
            transaction: {
              status: 'mined',
              confirmations: 0,
              hash: '0x123',
            },
          }
        )
      ).toEqual({
        '0x123': {
          status: 'mined',
          confirmations: 0,
          hash: '0x123',
        },
      })
    })
  })

  describe('when receiving UPDATE_TRANSACTION', () => {
    it('should not change state when trying to update the hash', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      const state = {
        [transaction.hash]: transaction,
      }
      const action = {
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update: {
          hash: '0x456',
        },
      }
      expect(reducer(state, action)).toEqual(state)
    })

    it('should not change state when trying to update a transaction which does not exist', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      const state = {}
      const action = {
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update: {
          hash: '0x123',
        },
      }
      expect(reducer(state, action)).toEqual(state)
    })

    it('should update an existing transaction', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      const state = {
        [transaction.hash]: transaction,
      }
      const action = {
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update: {
          status: 'mined',
          confirmations: 3,
        },
      }

      expect(reducer(state, action)).toEqual({
        '0x123': {
          status: 'mined',
          confirmations: 3,
          hash: '0x123',
        },
      })
    })

    it('should not mutate state of existing transactions', () => {
      expect.assertions(1)
      const transaction = {
        status: 'pending',
        confirmations: 0,
        hash: '0x123',
      }

      const state = {
        [transaction.hash]: transaction,
      }
      const action = {
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update: {
          status: 'mined',
          confirmations: 3,
        },
      }

      expect(reducer(state, action)['0x123']).not.toBe(transaction)
    })
  })

  describe('when receiving DELETE_TRANSACTION', () => {
    it('should remove the transaction which has been deleted from the list of all transactions', () => {
      expect.assertions(1)
      const transaction = {
        hash: '0x123',
        status: 'pending',
        confirmations: 0,
      }

      const transactions = {
        '0x123': transaction,
      }

      expect(
        reducer(transactions, {
          type: DELETE_TRANSACTION,
          transaction,
        })
      ).toEqual({})
    })

    it('should keep the transactions when another one has been deleted', () => {
      expect.assertions(1)
      const transaction = {
        hash: '0x123',
        status: 'pending',
        confirmations: 0,
      }

      const transactionToKeep = {
        hash: '0x456',
        status: 'mined',
        confirmations: 12,
      }

      const transactions = {
        '0x123': transaction,
        '0x456': transactionToKeep,
      }

      expect(
        reducer(transactions, {
          type: DELETE_TRANSACTION,
          transaction,
        })
      ).toEqual({
        '0x456': transactionToKeep,
      })
    })
  })
})
