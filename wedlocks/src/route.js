import templates, {
  PrecompiledTemplates,
} from '@unlock-protocol/email-templates'
import Handlebars from 'handlebars/runtime'
import { templateRenderer } from './templateRenderer'
import emailService from './emailService'
import { processParams } from './paramsProcessor'

// Set a default inlineImage helper
Handlebars.registerHelper('inlineImage', (filename) => `cid:${filename}`)

/**
 * Loads a template and sends an email using the provided parameters
 * @param {Object} args - The email arguments
 * @param {string} args.template - Name of the template to use
 * @param {string} [args.failoverTemplate] - Fallback template name if main template fails
 * @param {string} args.recipient - Email address of the recipient
 * @param {Object} args.params - Template parameters as key-value pairs. Values can be strings or {encrypt: boolean, value: string}
 * @param {Array} [args.attachments] - Array of attachments as data-uri strings
 * @param {string} [args.emailSender] - Custom sender name, defaults to "Unlock Labs"
 * @param {string} [args.replyTo] - Reply-to email address
 * @returns {Promise} Result of sending the email
 */
const getTemplateAndParams = async (args, opts) => {
  let template = templates[args.template.toLowerCase()]

  if (!template && args.failoverTemplate) {
    template = templates[args.failoverTemplate.toLowerCase()]
  }

  if (!template) {
    throw new Error('Missing template')
  }

  const templateParams = {}
  Object.keys(args.params).forEach((key) => {
    const param = args.params[key]
    templateParams[key] = param
  })

  if (template.nowrap) {
    return [template, templateParams]
  }

  // Wrap the template
  return [await wrap(template, opts), templateParams]
}

const buildEmail = async (template, templateParams, args) => {
  return {
    from: {
      name: args?.emailSender || 'Unlock Labs',
      address: 'hello@unlock-protocol.com',
    },
    to: args.recipient,
    replyTo: args?.replyTo || undefined,
    subject: await template.subject(templateParams),
    text: template.text ? await template.text(templateParams) : undefined,
    html: template.html ? await template.html(templateParams) : undefined,
    attachments: []
      .concat(args.attachments, template.attachments)
      .filter((x) => !!x),
  }
}

// This function loads the template and performs the actual email sending
// args: {
//  template: templateName string
//  failoverTemplate: failoverTemplate string
//  recipient: email address string
//  params: params for the template (as a hash). Each param is key: value where value can be either a string, or an object with {sign: <boolean></boolean>, value: <string>}
//  attachments: array of attachments as data-uri strings (nodemailer will handle them)
// }
export const route = async (args, config) => {
  const {
    template: templateName,
    params,
    emailSender,
    recipient,
    replyTo,
    attachments,
  } = args
  // process parameters
  const processedParams = processParams(params)

  // Validate template exists
  templateRenderer.validateTemplateExists(templateName)

  // Render email content
  const subject = templateRenderer.renderSubject(templateName, processedParams)
  const html = templateRenderer.renderHtml(templateName, processedParams)
  const text = templateRenderer.renderText(templateName, processedParams)

  // Prepare email data
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
    attachments: []
      .concat(attachments || [], templates[templateName]?.attachments || [])
      .filter(Boolean),
  }

  // Send email
  return emailService.send(config, email)
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
    const precompiledTemplate = PrecompiledTemplates[templateName]
    if (!precompiledTemplate) {
      return `<html><body>
        <h1>Template Not Found: ${templateName}</h1>
        <p>Available templates: ${Object.keys(templates).join(', ')}</p>
        </body></html>`
    }
    const renderedHtml = templateRenderer.renderHtml(templateName, params || {})
    const subject = templateRenderer.renderSubject(templateName, params || {})
    const text = templateRenderer.renderText(templateName, params || {})
    if (!json) return renderedHtml
    return JSON.stringify({
      from: {
        name: emailSender || 'Unlock Labs',
        address: 'hello@unlock-protocol.com',
      },
      to: recipient || 'recipient@example.com',
      replyTo: replyTo || undefined,
      subject,
      html: renderedHtml,
      text,
      attachments: [].concat(attachments || []).filter(Boolean),
    })
  } catch (error) {
    return `<p>Error previewing email template: ${error.message}</p>
            <pre>${error.stack}</pre>`
  }
}

/**
 * Returns a list of all available email templates
 * @returns {Promise<string>} JSON string of template names
 */
export const list = async () => JSON.stringify(Object.keys(templates))
