export enum emailTemplate {
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
    attachments: Attachment[] = [],
    replyTo?: string | null,
    emailSender?: string | null
  ) => {
    try {
      const payload = {
        template,
        recipient,
        params,
        attachments,
        replyTo,
        emailSender,
      }
      return await fetch(this.uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send email', error)
    }
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
