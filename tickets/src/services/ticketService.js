import axios from 'axios'
import UnlockEvent from '../structured_data/unlockEvent'

export default class TicketService {
  constructor(host) {
    this.host = host
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Saves an event to locksmith - either creating a new event or updating an existing record.
   * @param {*} event
   * @returns {Promise<*>}
   */
  async saveEvent(
    { lockAddress, name, description, location, date, owner, logo },
    token
  ) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }
    const payload = UnlockEvent.build({
      lockAddress,
      name,
      description,
      location,
      date,
      owner,
      logo,
    })

    // First check if the event exists
    const res = await axios.get(`${this.host}/events/${lockAddress}`, {
      validateStatus: false,
    })
    if (res.status === 200) {
      try {
        // If so, update the record
        return await axios.put(
          `${this.host}/events/${lockAddress}`,
          payload,
          opts
        )
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      try {
        // Otherwise create it
        await axios.post(`${this.host}/events/`, payload, opts)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

  /**
   * Retrieves new event details from locksmith by its lock address
   * @param {*} lockAddress
   * @returns {Promise<*>}
   */
  async getEvent(lockAddress) {
    try {
      return await axios.get(`${this.host}/events/${lockAddress}`)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
