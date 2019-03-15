import {
  CANONICAL_BASE_STAGING_URL,
  CANONICAL_BASE_DEV_URL,
  CANONICAL_BASE_URL,
} from '../../constants'

const { unlockUrl } = require('../../utils/unlockUrl')

describe('unlockUrl', () => {
  it('should return an environment variable for the url if it is set', () => {
    expect.assertions(1)

    const url = unlockUrl({ UNLOCK_URL: 'https://foo/bar' })
    expect(url).toEqual('https://foo/bar')
  })
  it('should return a default url', () => {
    expect.assertions(1)

    const url = unlockUrl()
    expect(url).toEqual(CANONICAL_BASE_DEV_URL)
  })
  it('should return a default production url', () => {
    expect.assertions(1)

    const url = unlockUrl({}, { unlockEnv: 'prod' })
    expect(url).toEqual(CANONICAL_BASE_URL)
  })
  it('should return a default staging url', () => {
    expect.assertions(1)

    const url = unlockUrl({}, { unlockEnv: 'staging' })
    expect(url).toEqual(CANONICAL_BASE_STAGING_URL)
  })
})
