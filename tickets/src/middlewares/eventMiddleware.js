/* eslint promise/prefer-await-to-then: 0 */

import EventService from '../services/eventService'
import {
  ADD_EVENT,
  LOAD_EVENT,
  updateEvent,
  eventError,
} from '../actions/event'
import { signData, SIGNED_DATA } from '../actions/signature'
import UnlockEvent from '../structured_data/unlockEvent'
import { lockRoute } from '../utils/routes'

const eventMiddleware = config => {
  const { services } = config
  return ({ dispatch, getState }) => {
    const eventService = new EventService(services.storage.host)

    const {
      router: {
        location: { pathname },
      },
    } = getState()
    const { lockAddress } = lockRoute(pathname)

    return next => {
      setTimeout(() => {
        if (lockAddress) {
          eventService.getEvent(lockAddress).then(event => {
            dispatch(updateEvent(event))
          })
        }
      }, 0) // WEIRD HACK?

      return action => {
        // Initial event to add a new ticketed event: here we process data and send for signing
        if (action.type === ADD_EVENT) {
          const {
            lockAddress,
            name,
            description,
            location,
            date,
            owner,
            duration,
            logo,
            image,
            links,
          } = action.event
          const data = UnlockEvent.build({
            lockAddress,
            name,
            description,
            location,
            date,
            owner,
            duration,
            logo,
            image,
            links,
          })
          // We need to sign the data before we can store it
          dispatch(signData(data))
        }

        // Once our ticketed event data has come back with a signature, we can store it in locksmith
        if (
          action.type === SIGNED_DATA &&
          action.data.message &&
          action.data.message.event
        ) {
          eventService
            .saveEvent(action.data.message.event, action.signature)
            .catch(error => dispatch(eventError(error)))
        }

        // Load an event from locksmith
        if (action.type === LOAD_EVENT) {
          eventService.getEvent(action.address).then(event => {
            dispatch(updateEvent(event))
          })
        }
        next(action)
      }
    }
  }
}

export default eventMiddleware
