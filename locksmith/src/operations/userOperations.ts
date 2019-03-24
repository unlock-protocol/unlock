const ethJsUtil = require('ethereumjs-util')
const models = require('../models')
const { User, UserReference } = models
import { UserCreationInput } from '../types'

namespace UserOperations {
  export async function createUser(input: UserCreationInput): Promise<Boolean> {
    let userReference = await UserReference.create(
      {
        emailAddress: input.emailAddress.toLowerCase(),
        User: {
          publicKey: ethJsUtil.toChecksumAddress(input.publicKey),
          recoveryPhrase: input.recoveryPhrase,
          passwordEncryptedPrivateKey: input.passwordEncryptedPrivateKey,
        },
      },
      {
        include: User,
      }
    )

    if (userReference) {
      return true
    } else {
      return false
    }
  }

  export async function getUserPrivateKeyByEmailAddress(
    emailAddress: String
  ): Promise<String | null> {
    let user = await UserReference.findOne({
      where: { emailAddress: emailAddress.toLowerCase() },
      include: [{ model: User, attributes: ['passwordEncryptedPrivateKey'] }],
    })

    if (user) {
      return user.User.passwordEncryptedPrivateKey
    } else {
      return null
    }
  }

  export async function getUserRecoveryPhraseByEmailAddress(
    emailAddress: String
  ): Promise<String | null> {
    let user = await UserReference.findOne({
      where: { emailAddress: emailAddress.toLowerCase() },
      include: [{ model: User, attributes: ['recoveryPhrase'] }],
    })

    if (user) {
      return user.User.recoveryPhrase
    } else {
      return null
    }
  }
}

export = UserOperations
