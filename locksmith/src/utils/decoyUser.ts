import { ethers } from 'ethers'
import randomWords from 'random-words'

export class DecoyUser {
  recoveryPhrase(): string {
    return randomWords(5).join(' ')
  }

  async encryptedPrivateKey() {
    return ethers.Wallet.createRandom().encrypt(randomWords(5).join(' '))
  }
}

export default DecoyUser
