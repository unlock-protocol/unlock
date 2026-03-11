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
    try {
      const mailer = await WorkerMailer.connect(smtpConfig)
      return mailer.send(emailData)
    } catch (error) {
      console.error('Email service error:', error.message)
      throw error
    }
  },
}

export default emailService
