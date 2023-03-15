import { rewriteIpfsUrl } from '../../utils/url'
import { it, describe, expect } from 'vitest'
describe('url', () => {
  it('correctly parse url', () => {
    expect.assertions(1)
    const url =
      'ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/wiki/Vincent_van_Gogh.html'

    expect(rewriteIpfsUrl(url)).toBe(
      'ipfs://cloudflare-ipfs.com/ipfs/wiki/Vincent_van_Gogh.html'
    )
  })

  it('not ipfs url', () => {
    expect.assertions(1)
    const url = 'https://google.it'

    expect(rewriteIpfsUrl(url)).toBe('https://google.it/')
  })

  it('wrong url returns same url', () => {
    expect.assertions(1)
    const url = 'google.it'

    expect(rewriteIpfsUrl(url)).toBe('google.it')
  })
})
