import { templateRenderer } from './templateRenderer'
import emailService from './emailService'

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
 * @returns {Promise} Result of sending the email
 */
export const route = async (args, smtpConfig) => {
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
    templateRenderer.validateTemplateExists(templateName)
    resolvedTemplate = templateName
  } catch {
    if (failoverTemplate) {
      templateRenderer.validateTemplateExists(failoverTemplate)
      resolvedTemplate = failoverTemplate
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
      email: 'hello@unlock-protocol.com',
    },
    to: { email: recipient },
    replyTo: replyTo ? { email: replyTo } : undefined,
    subject,
    html,
    text,
    attachments: [].concat(attachments || []).filter(Boolean),
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
    recipient,
    replyTo,
    attachments,
  } = args
  try {
    const renderedHtml = templateRenderer.renderHtmlPreview(
      templateName,
      params || {}
    )
    const subject = templateRenderer.renderSubject(templateName, params || {})
    const text = templateRenderer.renderText(templateName, params || {})
    if (!json) return renderedHtml
    return JSON.stringify({
      from: {
        name: emailSender || 'Unlock Labs',
        email: 'hello@unlock-protocol.com',
      },
      to: recipient || 'recipient@example.com',
      replyTo: replyTo ? { email: replyTo } : undefined,
      subject,
      html: renderedHtml,
      text,
      attachments: [].concat(attachments || []).filter(Boolean),
    })
  } catch (error) {
    return `<p>Error previewing email template: ${error.message}</p>`
  }
}

/**
 * Returns a list of all available email templates
 * @returns {Promise<string>} JSON string of template names
 */
export const list = async () => {
  const templates = await import('@unlock-protocol/email-templates')
  return JSON.stringify(Object.keys(templates.default))
}
