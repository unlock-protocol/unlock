import { encrypt } from 'ethers/utils/secret-storage'
import randomWords from 'random-words'

export class DecoyUser {
  recoveryPhrase(): String {
      return randomWords(5).join(' ')
  }

  async encryptedPrivateKey() {
    return encrypt(
      '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318',
      randomWords(5).join(' ')
    )
  }
}
