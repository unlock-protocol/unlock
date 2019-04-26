import nodemailer from 'nodemailer'
import templates from './templates'
import config from './config'

// This function loads the template and performs the actual email sending
// args: {
//  template: templateName string
//  recipient: email aderess string
//  params: params for the template (as a hash)
//  attachments: array of attachements as data-uri strings (nodemailer will handle them)
// }
export const route = (args, callback) => {
  const template = templates[args.template]

  if (!template) {
    return callback(new Error('Missing template'))
  }

  nodemailer.createTransport(config).sendMail(
    {
      from: config.sender,
      to: args.recipient,
      subject: template.subject(args.params),
      text: template.text(args.params),
      // optional extra arguments for SendRawEmail
      html: null, // TODO: support later
      attachments: args.attachments,
    },
    (err, info) => {
      return callback(err, info)
    }
  )
}

export default {
  route,
}
