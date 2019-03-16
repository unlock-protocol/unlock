import {
  mapStateToProps,
  mapDispatchToProps,
} from '../../../components/lock/Lock'
import { purchaseKey } from '../../../actions/key'
import { TransactionType } from '../../../unlock'
import { openNewWindowModal } from '../../../actions/modal'

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

    it('should dispatch openNewWindowModal if the openNewWindow prop is truthy', () => {
      expect.assertions(2)
      const dispatch = jest.fn()
      const props = {
        showModal: jest.fn(),
        openInNewWindow: true,
      }
      const key = {}

      const newProps = mapDispatchToProps(dispatch, props)

      newProps.purchaseKey(key)
      expect(props.showModal).not.toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith(openNewWindowModal())
    })
  })

  describe('mapStateToProps', () => {
    it('should return a new lockKey and no transaction when there is no matching key', () => {
      expect.assertions(5)
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
      expect(newProps.transaction).toEqual(undefined) // Array::find will return undefined if no item is matched
    })

    it('should return the lockKey and its transaction if applicable', () => {
      expect.assertions(5)
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
            type: TransactionType.KEY_PURCHASE,
            status: 'pending',
            hash: '0x777',
            key: '0x123-0x456',
          },
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.lockKey.lock).toEqual(props.lock.address)
      expect(newProps.lockKey.owner).toEqual(state.account.address)
      expect(newProps.lockKey.data).toEqual('hello')
      expect(newProps.lockKey.expiration).toEqual(1000)
      expect(newProps.transaction).toEqual(state.transactions['0x777'])
    })
  })
})
