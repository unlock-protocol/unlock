import base from './templates/base'

/**
 * Function which wraps a template into the base stuff
 * @param {*} template
 * @returns
 */
const wrap = (template) => {
  const wrappedTemplate = {
    subject: template.subject,
  }

  if (template.text) {
    wrappedTemplate.text = template.text
  }

  if (template.html) {
    wrappedTemplate.html = (params) => {
      const content = template.html(params)
      return base({
        content,
      })
    }
  }

  wrappedTemplate.attachments = template.attachments || []

  return wrappedTemplate
}

export default wrap
