import { it, expect } from 'vitest'
import { getCertificateLinkedinShareUrl } from '../../src/utils/certificationHelpers'

const lockAddress = '0xDd4356111193f7B28A20b5FC2Dc7750c249E55d2'
const network = 10
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
      lockAddress,
      network,
      tokenId,
      metadata,
    })
    expect(url).toBe(
      'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Example+with+metadata&organizationName=UnlockProcol+-+Demo&certUrl=https%3A%2F%2Fstaging-app.unlock-protocol.com%2Fcertification%3Fs%3Dtest-demo&certId=2'
    )
  })
})
