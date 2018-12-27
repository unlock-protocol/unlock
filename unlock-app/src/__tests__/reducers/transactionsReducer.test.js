import reducer, { initialState } from '../../reducers/transactionsReducer'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  DELETE_TRANSACTION,
} from '../../actions/transaction'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('transaction reducer', () => {
  it('should return the initial state', () => {
    expect(initialState).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
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
    ).toEqual({})
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
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
    ).toEqual({})
  })

  describe('when receiving ADD_TRANSACTION', () => {
    it('should set the transaction accordingly if it has not been previously added', () => {
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
  })

  describe('when receiving DELETE_TRANSACTION', () => {
    it('should remove the transaction which has been deleted from the list of all transactions', () => {
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
