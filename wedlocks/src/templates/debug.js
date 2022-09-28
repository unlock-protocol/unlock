import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Debug Email'),
  text: handlebars.compile(
    `Welcome to Unlock!
This is a test email. Please ignore and/or report if you're getting it!
  {{foo}}
The Unlock team
  `
  ),
}
