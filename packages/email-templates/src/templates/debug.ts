import { prepareAll } from './prepare'

export default prepareAll({
  subject: 'Debug Email',
  html: `<h1>
      Welcome to Unlock!
    </h1>
    <p>This is a test email. Please ignore and/or report if you're getting it!
    {{foo}}</p>
    `,
})
