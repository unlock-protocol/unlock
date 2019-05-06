/* eslint promise/prefer-await-to-then: 0 */

import WedlockService from '../services/wedlockService'
import { SEND_CONFIRMATION } from '../actions/email'

const wedlockMiddleware = config => {
  const { services } = config
  return () => {
    const wedlockService = new WedlockService(services.wedlocks.uri)

    return next => {
      return action => {
        if (action.type === SEND_CONFIRMATION) {
          const { recipient, ticket, eventName, eventDate, ticketLink } = action

          wedlockService.confirmEvent(
            recipient,
            ticket,
            eventName,
            eventDate,
            ticketLink
          )
        }

        next(action)
      }
    }
  }
}

export default wedlockMiddleware
