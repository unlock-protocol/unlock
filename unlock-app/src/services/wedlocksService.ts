import axios from 'axios'

/* eslint-disable no-unused-vars */
enum emailTemplate {
  signupConfirmation = 'confirmEmail',
}
/* eslint-enable no-unused-vars */

type Params = {
  [key: string]: any
}

export default class WedlocksService {
  private uri: string

  constructor(uri: string) {
    this.uri = uri
  }

  sendEmail = (
    template: emailTemplate,
    recipient: string,
    params: Params = {}
  ) => {
    const payload = {
      template,
      recipient,
      params,
    }

    return axios.post(this.uri, payload)
  }

  confirmEmail = (recipient: string) => {
    return this.sendEmail(emailTemplate.signupConfirmation, recipient)
  }
}
