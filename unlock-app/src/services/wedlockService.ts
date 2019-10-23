import axios from 'axios'

export enum emailTemplate {
  signupConfirmation = 'confirmEmail',
  welcome = 'welcome',
  keyOwnership = 'keyOwnership',
}

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
    attachments: Attachment[] = []
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

  confirmEmail = (recipient: string, confirmLink: string) => {
    return this.sendEmail(emailTemplate.signupConfirmation, recipient, {
      email: encodeURIComponent(recipient),
      signedEmail: {
        value: recipient,
        encrypt: true,
      },
      confirmLink,
    })
  }

  welcomeEmail = (recipient: string, recoveryLink: string) => {
    return this.sendEmail(emailTemplate.welcome, recipient, {
      email: encodeURIComponent(recipient),
      recoveryLink: recoveryLink,
    })
  }

  keychainQREmail = (
    recipient: string,
    keychainLink: string,
    lockName: string,
    keyQR: string
  ) => {
    return this.sendEmail(
      emailTemplate.keyOwnership,
      recipient,
      {
        keychainLink,
        lockName,
      },
      [{ path: keyQR }]
    )
  }
}
