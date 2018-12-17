import {
  mapStateToProps,
  mapDispatchToProps,
} from '../../../components/lock/Lock'
import { purchaseKey } from '../../../actions/key'

describe('Lock', () => {
  describe('mapDispatchToProps', () => {
    it('should return a purchaseKey function which when invoked dispatches purchaseKey and invokes showModal', () => {
      expect.assertions(2)
      const dispatch = jest.fn()
      const props = {
        showModal: jest.fn(),
      }
      const key = {}

      const newProps = mapDispatchToProps(dispatch, props)

      newProps.purchaseKey(key)
      expect(props.showModal).toHaveBeenCalledWith()
      expect(dispatch).toHaveBeenCalledWith(purchaseKey(key))
    })
  })

  describe('mapStateToProps', () => {
    it('should return a new lockKey and no transaction when there is no matching key', () => {
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
      expect(newProps.lockKey.lock).toEqual(props.lock.address)
      expect(newProps.lockKey.owner).toEqual(state.account.address)
      expect(newProps.lockKey.data).toEqual(undefined)
      expect(newProps.lockKey.expiration).toEqual(undefined)
      expect(newProps.transaction).toEqual(null)
    })

    it('should return the lockKey and its transaction if applicable', () => {
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
        keys: [
          {
            lock: props.lock.address,
            owner: '0x123',
            expiration: 1000,
            data: 'hello',
            transaction: '0x777',
          },
        ],
        transactions: {
          '0x777': {
            status: 'pending',
            hash: '0x777',
          },
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.lockKey.lock).toEqual(props.lock.address)
      expect(newProps.lockKey.owner).toEqual(state.account.address)
      expect(newProps.lockKey.data).toEqual('hello')
      expect(newProps.lockKey.expiration).toEqual(1000)
      expect(newProps.transaction).toEqual({
        status: 'pending',
        hash: '0x777',
      })
    })
  })
})
