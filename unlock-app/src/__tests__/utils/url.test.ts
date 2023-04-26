import { rewriteIpfsUrl, getSlugParamsFromUrl } from '../../utils/url'
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

describe('getSlugParamsFromUrl helper', () => {
  it('returns hash and params', () => {
    expect.assertions(4)
    expect(
      getSlugParamsFromUrl('/certification#test-event-2?tokenId=2')
    ).toStrictEqual({
      hash: 'test-event-2',
      params: {
        tokenId: '2',
      },
    })

    expect(
      getSlugParamsFromUrl('/certification#test-event-2?tokenId=2&domain=test')
    ).toStrictEqual({
      hash: 'test-event-2',
      params: {
        tokenId: '2',
        domain: 'test',
      },
    })

    expect(getSlugParamsFromUrl('/event#test')).toStrictEqual({
      hash: 'test',
      params: {},
    })

    expect(getSlugParamsFromUrl('/event')).toStrictEqual({
      hash: undefined,
      params: {},
    })
  })
})
