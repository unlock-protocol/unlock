import prepare from './templates/prepare'
import * as templates from '@unlock-protocol/email-templates'

/**
 * Function which wraps a template into the base stuff
 * @param {*} template
 * @returns
 */
const wrap = (template, opts = {}) => {
  const wrappedTemplate = {
    subject: template.subject,
  }

  if (template.text) {
    wrappedTemplate.text = template.text
  }

  wrappedTemplate.attachments = template.attachments || []

  if (template.html) {
    wrappedTemplate.html = (params) => {
      const content = template.html(params)
      const [buildTemplate, getImages] = prepare(
        templates.bases[template.base || 'defaultBase'],
        opts
      )

      const result = buildTemplate({ content })
      const images = getImages()

      images.forEach((image) => {
        wrappedTemplate.attachments.push(image)
      })

      return result
    }
  }

  return wrappedTemplate
}

export default wrap
