import { UserCreationInput } from '../types' // eslint-disable-line no-unused-vars

const ethJsUtil = require('ethereumjs-util')
const models = require('../models')

const { User, UserReference } = models

namespace UserOperations {
  export const createUser = async (
    input: UserCreationInput
  ): Promise<Boolean> => {
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

  export const getUserPrivateKeyByEmailAddress = async (
    emailAddress: String
  ): Promise<String | null> => {
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

  export const getUserRecoveryPhraseByEmailAddress = async (
    emailAddress: String
  ): Promise<String | null> => {
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
