import axios from 'axios'

export default class TicketService {
  constructor(host) {
    this.host = host
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Saves a new event to locksmith
   * @param {*} event
   * @param {*} token
   * @returns {Promise<*>}
   */
  async createEvent(
    { lockAddress, name, description, location, date, owner, logo },
    token
  ) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }
    const payload = {
      message: {
        event: {
          lockAddress,
          name,
          description,
          location,
          date,
          owner,
          logo,
        },
      },
    }
    try {
      return await axios.post(`${this.host}/events/`, payload, opts)
    } catch (error) {
      return Promise.reject(error)
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
