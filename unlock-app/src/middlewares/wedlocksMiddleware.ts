import WedlockService from '../services/wedlockService'
import { SIGNUP_EMAIL } from '../actions/signUp'
import { Action } from '../unlockTypes' // eslint-disable-line no-unused-vars

const wedlocksMiddleware = (config: any) => {
  const { services } = config
  const wedlockService = new WedlockService(services.wedlocks.host)
  // eslint-disable-next-line no-unused-vars
  return (_: any) => {
    return (next: any) => {
      return (action: Action) => {
        if (action.type === SIGNUP_EMAIL) {
          const { origin } = window.location
          // TODO: then and catch? I think we really only need to worry about errors.
          wedlockService.confirmEmail(
            action.emailAddress,
            `${origin}/keychain#${action.emailAddress}`
          )
        }
        next(action)
      }
    }
  }
}

export default wedlocksMiddleware
