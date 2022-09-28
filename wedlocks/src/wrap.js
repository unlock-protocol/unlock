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
  // Add the attachements
  wrappedTemplate.attachments = template.attachments || []

  if (template.html) {
    wrappedTemplate.html = (params) => {
      const content = template.html(params)
      return base({
        content,
      })
    }
    wrappedTemplate.attachments.push({
      filename: 'unlock-logo.png',
      path: __dirname + '/../static/attachments/unlock-logo.png',
      cid: 'unlock-logo.png',
    })
    wrappedTemplate.attachments.push({
      filename: 'discord.png',
      path: __dirname + '/../static/attachments/discord.png',
      cid: 'discord.png',
    })
    wrappedTemplate.attachments.push({
      filename: 'github.png',
      path: __dirname + '/../static/attachments/github.png',
      cid: 'github.png',
    })
    wrappedTemplate.attachments.push({
      filename: 'twitter.png',
      path: __dirname + '/../static/attachments/twitter.png',
      cid: 'twitter.png',
    })
  }

  return wrappedTemplate
}

export default wrap
