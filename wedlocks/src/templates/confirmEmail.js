import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Please confirm your email address'),
  html: handlebars.compile(
    `<h1>Welcome to Unlock!</h1>

    <p>To get started, please confirm your email address by clicking on <a href="{{confirmLink}}?email={{email}}&signedEmail={{signedEmail}}">this link</a>.</p>

    <p>
      You can also copy and paste the following URL on your web browser: <code>{{confirmLink}}?email={{email}}&signedEmail={{signedEmail}}</code>    
    </p>

    <p>Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.</p>
`
  ),
}
