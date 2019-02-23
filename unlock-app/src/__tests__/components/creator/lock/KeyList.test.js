import {
  mapStateToProps,
  mapDispatchToProps,
} from '../../../../components/creator/lock/KeyList'

describe('KeyList', () => {
  describe('mapStateToProps', () => {
    it('should yield the keys, page and lock', () => {
      expect.assertions(1)
      const keys = [{}, {}]
      const page = 3
      const lock = {
        address: '0x123',
      }
      const state = {
        keysForLockByPage: {
          '0x123': {
            keys,
            page,
          },
        },
      }
      expect(mapStateToProps(state, { lock })).toEqual({
        page,
        keys,
      })
    })
  })

  describe('mapDispatchToProps', () => {
    it('should yield a loadPage function which dispatches the right action', () => {
      expect.assertions(1)
      const dispatch = jest.fn()
      const lock = {
        address: '0x123',
      }
      const page = 3

      const props = mapDispatchToProps(dispatch, { lock })
      props.loadPage(page)
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_KEYS_ON_PAGE_FOR_LOCK',
        keys: undefined,
        lock: lock.address,
        page: page - 1, // The UI pagination starts at 1, while the webService starts at 0
      })
    })
  })
})
