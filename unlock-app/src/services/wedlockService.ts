import axios from 'axios'

/* eslint-disable no-unused-vars */
export enum emailTemplate {
  signupConfirmation = 'confirmEmail',
}
/* eslint-enable no-unused-vars */

type Params = {
  [key: string]: any
}

export default class WedlockService {
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
    const result = axios.post(this.uri, payload, {
      headers: {
        'content-type': 'application/json',
      },
    })

    return result
  }

  confirmEmail = (recipient: string, confirmLink: string) => {
    return this.sendEmail(emailTemplate.signupConfirmation, recipient, {
      confirmLink,
    })
  }
}
