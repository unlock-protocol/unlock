import Web3 from 'web3'
import WedlockService from '../services/wedlockService'
import { SIGNUP_EMAIL, SIGNUP_CREDENTIALS, createUser } from '../actions/signUp'
import UnlockUser from '../structured_data/unlockUser'
import { Action } from '../unlockTypes' // eslint-disable-line no-unused-vars

const wedlocksMiddleware = (config: any) => {
  const { services } = config
  const wedlockService = new WedlockService(services.wedlocks.host)
  const web3 = new Web3()
  return ({ dispatch }: any) => {
    return (next: any) => {
      return (action: Action) => {
        if (action.type === SIGNUP_EMAIL) {
          // TODO: then and catch? I think we really only need to worry about errors.
          wedlockService.confirmEmail(action.emailAddress)
        }

        if (action.type === SIGNUP_CREDENTIALS) {
          const { emailAddress, password } = action
          const { address, privateKey } = web3.eth.accounts.create()
          const passwordEncryptedPrivateKey = web3.eth.accounts.encrypt(
            privateKey,
            password
          )

          const user = UnlockUser.build({
            emailAddress,
            publicKey: address,
            passwordEncryptedPrivateKey,
          })

          dispatch(createUser(user))
        }
        next(action)
      }
    }
  }
}

export default wedlocksMiddleware
