import config from '../config/config'
import { EventData } from '../models'

export const getEventUrl = (event: EventData): string => {
  return `${config.unlockApp}/event/${event.slug}`
}
