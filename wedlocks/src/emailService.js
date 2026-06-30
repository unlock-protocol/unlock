import { WorkerMailer } from 'worker-mailer'

/**
 * Email service for sending emails
 */
export const emailService = {
  /**
   * Send an email using the configured mail transport
   * @param {Object} emailData - The email data object
   */
  async send(emailData, smtpConfig) {
    const mailer = await WorkerMailer.connect(smtpConfig)
    return mailer.send(emailData)
  },
}

export default emailService
