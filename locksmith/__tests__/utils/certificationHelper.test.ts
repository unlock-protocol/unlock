import { it, expect, vi, describe } from 'vitest'
import { getCertificateLinkedinShareUrl } from '../../src/utils/certificationHelpers'

// Mock the config module
vi.mock('../../src/config/config', () => ({
  default: {
    unlockApp: 'https://mock-app.unlock-protocol.com',
  },
}))

const tokenId = '2'

const metadata = {
  name: 'Example with metadata',
  description: 'exaple test',
  external_url: 'https://google.it',
  slug: 'test-demo',
  attributes: [
    {
      trait_type: 'certification_issuer',
      value: 'UnlockProcol - Demo',
    },
  ],
}

describe('getCertificateLinkedinShareUrl', () => {
  it('create correct linkedin share url with slug', () => {
    expect.assertions(1)
    const url = getCertificateLinkedinShareUrl({
      tokenId,
      metadata,
    })
    expect(url).toBe(
      'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Example+with+metadata&organizationName=UnlockProcol+-+Demo&certUrl=https%3A%2F%2Fmock-app.unlock-protocol.com%2Fcertification%2Ftest-demo&certId=2'
    )
  })
})
