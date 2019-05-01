import axios from 'axios'

/* eslint-disable no-unused-vars */
export enum emailTemplate {
  confirmEvent = 'confirmEvent',
}
/* eslint-enable no-unused-vars */

type Params = {
  [key: string]: any
}

type Attachment = {
  path: string
}

export default class WedlockService {
  private uri: string

  constructor(uri: string) {
    this.uri = uri
  }

  sendEmail = (
    template: emailTemplate,
    recipient: string,
    params: Params = {},
    attachments: Attachment[]
  ) => {
    const payload = {
      template,
      recipient,
      params,
      attachments,
    }
    const result = axios.post(this.uri, payload, {
      headers: {
        'content-type': 'application/json',
      },
    })

    return result
  }

  confirmEvent = (
    recipient: string,
    ticket: string,
    eventName: string,
    eventDate: string,
    confirmLink: string
  ) => {
    return this.sendEmail(
      emailTemplate.confirmEvent,
      recipient,
      {
        eventName,
        eventDate,
        confirmLink,
      },
      [{ path: ticket }]
    )
  }
}
