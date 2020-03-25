import * as sigUtil from 'eth-sig-util'

import { toBuffer } from 'ethereumjs-utils'
import { isSignatureValidForAddress } from '../../utils/signatures'

const privateKey =
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
const address = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const data = 'Sign me'

describe('isSignatureValidForAddress', () => {
  it('should return true if the signature matches the content and signer', () => {
    expect.assertions(1)
    const sig = sigUtil.personalSign(toBuffer(privateKey), { data })
    const isValid = isSignatureValidForAddress(sig, data, address)
    expect(isValid).toBe(true)
  })

  it('should return false if the signature was performed by another signer', () => {
    expect.assertions(1)

    const sig = sigUtil.personalSign(toBuffer(privateKey), { data })
    const isValid = isSignatureValidForAddress(sig, data, '0xanother')
    expect(isValid).toBe(false)
  })

  it('should return false if the signature signed different content', () => {
    expect.assertions(1)
    const sig = sigUtil.personalSign(toBuffer(privateKey), {
      data: 'wrong data',
    })

    const isValid = isSignatureValidForAddress(sig, data, address)
    expect(isValid).toBe(false)
  })

  it('should return false if the signature is not valid', () => {
    expect.assertions(1)
    const isValid = isSignatureValidForAddress('giberrish', data, address)
    expect(isValid).toBe(false)
  })
})
