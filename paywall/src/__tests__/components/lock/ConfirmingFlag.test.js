import { mapStateToProps } from '../../../components/lock/ConfirmingFlag'
import { TRANSACTION_TYPES } from '../../../constants'

describe('Lock', () => {
  describe('mapStateToProps', () => {
    it('should return no transaction when there is no matching key', () => {
      expect.assertions(1)
      const state = {
        network: {},
        account: {
          address: '0x123',
        },
        keys: [],
        transactions: {},
      }
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.transaction).toEqual(undefined) // Array::find will return undefined if no item is matched
    })

    it('should return the transaction if applicable', () => {
      expect.assertions(1)
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }

      const state = {
        network: {},
        account: {
          address: '0x123',
        },
        keys: {
          '0x123-0x456': {
            id: '0x123-0x456',
            lock: props.lock.address,
            owner: '0x123',
            expiration: 1000,
            data: 'hello',
          },
        },
        transactions: {
          '0x777': {
            type: TRANSACTION_TYPES.KEY_PURCHASE,
            status: 'pending',
            hash: '0x777',
            key: '0x123-0x456',
          },
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.transaction).toEqual(state.transactions['0x777'])
    })
  })
})
