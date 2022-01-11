import UnlockVersions from '../Unlock'
import { latestUnlock } from '../index'

describe('UnlockVersions', () => {
  it('contains latest version', () => {
    expect.assertions(1)
    const versions = Object.keys(UnlockVersions)
    expect(versions[versions.length - 1]).toBe(latestUnlock)
  })

  describe('getters', () => {
    expect.assertions(1)
    const versionNumbers = Object.keys(UnlockVersions)
      .map((d) => parseInt(d.replace('v', '')))
      .filter((v) => v >= 10) // getters starts on Unlock v10

    describe.each(versionNumbers)('Unlock v%s', (versionNumber) => {
      it('contains pure/view functions', () => {
        expect.assertions(3)
        const abi = UnlockVersions[`v${versionNumber}`]
        expect(Object.keys(abi)).toContain('owner()')
        expect(Object.keys(abi)).toContain('proxyAdminAddress()')
        expect(Object.keys(abi)).toContain('weth()')
      })
    })
  })
})
