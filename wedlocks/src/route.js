import nodemailer from 'nodemailer'
import logger from '../logger'
import templates from './templates'
import config from '../config'
import encrypter from './encrypter'

// This function loads the template and performs the actual email sending
// args: {
//  template: templateName string
//  recipient: email aderess string
//  params: params for the template (as a hash). Each param is key: value where value can be either a string, or an object with {sign: <boolean></boolean>, value: <string>}
//  attachments: array of attachements as data-uri strings (nodemailer will handle them)
// }
export const route = (args, callback) => {
  const template = templates[args.template]

  if (!template) {
    return callback(new Error('Missing template'))
  }

  const templateParams = {}
  Object.keys(args.params).forEach(key => {
    const param = args.params[key]
    if (typeof param === 'object' && param.encrypt) {
      templateParams[key] = encrypter.signParam(param.value)
    } else {
      templateParams[key] = param
    }
  })

  const email = {
    from: config.sender,
    to: args.recipient,
    subject: template.subject(templateParams),
    text: template.text(templateParams),
    // optional extra arguments for SendRawEmail
    html: null, // TODO: support later
    attachments: args.attachments,
  }

  // Shows the email to be sent
  logger.debug(email)

  nodemailer.createTransport(config).sendMail(email, (err, info) => {
    logger.info(JSON.stringify({ recipient: email.to, subject: email.subject }))
    return callback(err, info)
  })
}

export default {
  route,
}
