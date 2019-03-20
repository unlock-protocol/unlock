export default {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  },
  sender:
    process.env.SMTP_FROM_ADDRESS || 'Unlock <no-reply@unlock-protocol.com>' // TODO: can we do better eventually?
}
