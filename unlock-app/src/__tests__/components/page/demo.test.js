import { mapStateToProps } from '../../../pages/demo'

describe('Demo', () => {
  describe('mapStateToProps', () => {
    it('should yield the lock which matches the address of the demo page', () => {
      const lock = { address: '0x456' }
      const locks = [{ address: '0x123' }, lock]
      const props = mapStateToProps({ locks }, { lockAddress: '0x456' })
      expect(props.lock).toBe(lock)
    })
  })
})
