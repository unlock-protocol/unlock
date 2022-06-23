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

  sendEmail = async (
    template: emailTemplate,
    recipient: string,
    params: Params = {},
    attachments: Attachment[] = []
  ) => {
    try {
      const payload = {
        template,
        recipient,
        params,
        attachments,
      }
      const result = await fetch(this.uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      return await result?.json()
    } catch (error) {
      console.error('Failed to send email', error)
    }
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
      recoveryLink,
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
