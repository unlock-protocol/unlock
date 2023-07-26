import { ethers } from 'ethers'
import { generate } from 'random-words'

export class DecoyUser {
  recoveryPhrase(): string {
    return generate(5).join(' ')
  }

  async encryptedPrivateKey() {
    return ethers.Wallet.createRandom().encrypt(generate(5).join(' '))
  }
}

export default DecoyUser
