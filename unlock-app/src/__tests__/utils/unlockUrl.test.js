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
    expect(url).toEqual('http://localhost:3000')
  })
  it('should return a default production url', () => {
    expect.assertions(1)

    const url = unlockUrl({}, { unlockEnv: 'prod' })
    expect(url).toEqual('https://unlock-protocol.com')
  })
  it('should return a default staging url', () => {
    expect.assertions(1)

    const url = unlockUrl({}, { unlockEnv: 'staging' })
    expect(url).toEqual('https://staging.unlock-protocol.com')
  })
})
