import { mapStateToProps } from '../../../components/lock/Lock'

describe('Lock', () => {
  describe('mapStateToProps', () => {

    it('should return a new accessKey and no transaction when there is no matching key', () => {
      const state = {
        network: {
          account: {
            address: '0x123',
          },
        },
        keys: [],
        transactions: {
          all: {},
        },
      }
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.accessKey.lockAddress).toEqual(props.lock.address)
      expect(newProps.accessKey.owner).toEqual(state.network.account.address)
      expect(newProps.accessKey.data).toEqual(undefined)
      expect(newProps.accessKey.expiration).toEqual(undefined)
      expect(newProps.transaction).toEqual(null)
    })

    it('should return the accessKey and its transaction if applicable', () => {
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }

      const state = {
        network: {
          account: {
            address: '0x123',
          },
        },
        keys: [{
          lockAddress: props.lock.address,
          owner: '0x123',
          expiration: 1000,
          data: 'hello',
          transaction: '0x777',
        }],
        transactions: {
          all: {
            '0x777': {
              status: 'pending',
              hash: '0x777',
            },
          },
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.accessKey.lockAddress).toEqual(props.lock.address)
      expect(newProps.accessKey.owner).toEqual(state.network.account.address)
      expect(newProps.accessKey.data).toEqual('hello')
      expect(newProps.accessKey.expiration).toEqual(1000)
      expect(newProps.transaction).toEqual({
        status: 'pending',
        hash: '0x777',
      })
    })

  })
})
