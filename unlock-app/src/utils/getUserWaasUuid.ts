import { locksmith } from '~/config/locksmith'
import { UserAccountType } from './userAccountType'

/**
 * Given a user's email address, used provide and token retrieves their WAAS UUID. In the case of failure a rejected promise
 * is returned to the caller.
 * @param {*} emailAddress
 * @param {*} provider
 * @param {*} token
 * @returns {Promise<*>}
 */
export const getUserWaasUuid = async (
  captcha: string,
  emailAddress: string,
  provider: string,
  token: string
) => {
  let selectedProvider

  switch (provider) {
    case 'google':
      selectedProvider = UserAccountType.GoogleAccount
      break
    default:
      selectedProvider = ''
      break
  }

  try {
    const response = await locksmith.getWaasToken(
      captcha,
      emailAddress,
      selectedProvider,
      { token }
    )

    const waasToken = await response.data.token

    return waasToken
  } catch (error) {
    console.log(error)
  }
}
