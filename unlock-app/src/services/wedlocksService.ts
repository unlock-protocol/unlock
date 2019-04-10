import axios from 'axios'

export default class WedlocksService {
  private host: string
  constructor(host: string) {
    this.host = host
  }

  sendSignupEmail = (recipient: string) => {
    const payload = {
      template: '',
      recipient,
      params: {
        confirmLink: 'https://staging.unlock-protocol.com/',
      },
    }
    return axios.post(this.host, payload)
  }
}
