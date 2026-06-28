import { templateRenderer } from './templateRenderer'
import emailService from './emailService'

const DEFAULT_SENDER_ADDRESS = 'hello@unlock-protocol.com'

/**
 * Loads a template and sends an email using the provided parameters
 * @param {Object} args - The email arguments
 * @param {string} args.template - Name of the template to use
 * @param {string} [args.failoverTemplate] - Fallback template name if main template fails
 * @param {string} args.recipient - Email address of the recipient
 * @param {Object} args.params - Template parameters as key-value pairs
 * @param {Array} [args.attachments] - Array of attachments as data-uri strings
 * @param {string} [args.emailSender] - Custom sender name, defaults to "Unlock Labs"
 * @param {string} [args.replyTo] - Reply-to email address
 * @param {Object} smtpConfig - SMTP configuration for worker-mailer
 * @param {Object} [options] - Delivery options that are not SMTP settings
 * @param {string} [options.senderAddress] - Sender email address
 * @returns {Promise} Result of sending the email
 */
export const route = async (args, smtpConfig, options = {}) => {
  const {
    template: templateName,
    failoverTemplate,
    params = {},
    emailSender,
    recipient,
    replyTo,
    attachments,
  } = args

  // Resolve which template to use, falling back to failoverTemplate if needed
  let resolvedTemplate
  try {
    resolvedTemplate = templateRenderer.validateTemplateExists(templateName)
  } catch {
    if (failoverTemplate) {
      resolvedTemplate =
        templateRenderer.validateTemplateExists(failoverTemplate)
    } else {
      throw new Error('Missing template')
    }
  }

  const subject = templateRenderer.renderSubject(resolvedTemplate, params)
  const text = templateRenderer.renderText(resolvedTemplate, params)
  const html = templateRenderer.renderHtml(resolvedTemplate, params)

  const email = {
    from: {
      name: emailSender || 'Unlock Labs',
      email: options.senderAddress || DEFAULT_SENDER_ADDRESS,
    },
    to: { email: recipient },
    reply: replyTo ? { email: replyTo } : undefined,
    subject,
    html,
    text,
    attachments: templateRenderer.normalizeAttachments(
      []
        .concat(attachments || [])
        .concat(templateRenderer.getTemplateAttachments(resolvedTemplate))
    ),
  }

  return emailService.send(email, smtpConfig)
}

/**
 * Previews an email template with optional parameters
 * @param {Object} args - Preview arguments
 * @param {string} args.template - Name of template to preview
 * @param {Object} [args.params] - Template parameters
 * @param {boolean} [args.json] - Whether to return JSON format
 * @param {string} [args.emailSender] - Custom sender name
 * @param {string} [args.senderAddress] - Sender email address
 * @param {string} [args.recipient] - Test recipient email
 * @param {string} [args.replyTo] - Reply-to email address
 * @param {Array} [args.attachments] - Array of attachments
 * @returns {string} Rendered HTML or JSON string of email data
 */
export const preview = async (args) => {
  const {
    template: templateName,
    params,
    json,
    emailSender,
    senderAddress,
    recipient,
    replyTo,
    attachments,
  } = args
  try {
    const resolvedTemplate =
      templateRenderer.validateTemplateExists(templateName)
    const renderedHtml = templateRenderer.renderHtmlPreview(
      resolvedTemplate,
      params || {}
    )
    const subject = templateRenderer.renderSubject(
      resolvedTemplate,
      params || {}
    )
    const text = templateRenderer.renderText(resolvedTemplate, params || {})
    if (!json) return renderedHtml
    return JSON.stringify({
      from: {
        name: emailSender || 'Unlock Labs',
        email: senderAddress || DEFAULT_SENDER_ADDRESS,
      },
      to: recipient || 'recipient@example.com',
      replyTo: replyTo ? { email: replyTo } : undefined,
      subject,
      html: renderedHtml,
      text,
      attachments: templateRenderer.normalizeAttachments(
        []
          .concat(attachments || [])
          .concat(templateRenderer.getTemplateAttachments(resolvedTemplate))
      ),
    })
  } catch (error) {
    return `<p>Error previewing email template: ${templateRenderer.escapeHtml(
      error.message
    )}</p>`
  }
}

/**
 * Returns a list of all available email templates
 * @returns {Promise<string>} JSON string of template names
 */
export const list = async () => {
  return JSON.stringify(templateRenderer.listTemplateNames())
}
