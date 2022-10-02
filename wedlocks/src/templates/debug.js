import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Debug Email'),
  html: handlebars.compile(
    `<h1>
      Welcome to Unlock!
    </h1>
    <p>This is a test email. Please ignore and/or report if you're getting it!
    {{foo}}</p>
    `
  ),
}
