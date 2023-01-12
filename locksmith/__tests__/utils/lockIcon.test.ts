import { lockIcon } from '../../src/utils/lockIcon'

describe('lockIcon', () => {
  it('should generate the right svg for different locks', () => {
    expect.assertions(2)
    const lockIcon1 = lockIcon('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
    const lockIcon2 = lockIcon('0x95da5F777A3e283bFf0c47374998E10D8A2183C7')
    expect(lockIcon1).toMatch(/^<svg/)
    expect(lockIcon1).not.toEqual(lockIcon2)
  })
})
