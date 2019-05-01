/* eslint promise/prefer-await-to-then: 0 */

import WedlockService from '../services/wedlockService'
import { SEND_CONFIRMATION } from '../actions/email'

const wedlockMiddleware = config => {
  const { services } = config
  return () => {
    const wedlockService = new WedlockService(services.storage.host)

    return next => {
      return action => {
        if (action.type === SEND_CONFIRMATION) {
          const {
            recipient,
            ticket,
            eventName,
            eventDate,
            confirmLink,
          } = action

          wedlockService.confirmEvent(
            recipient,
            ticket,
            eventName,
            eventDate,
            confirmLink
          )
        }

        next(action)
      }
    }
  }
}

export default wedlockMiddleware
