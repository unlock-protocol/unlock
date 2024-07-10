import Handlebars from 'handlebars'
import { verificationCode } from './helpers/verificationCode'

Handlebars.registerHelper('verificationCode', verificationCode)

export default {
  subject: 'Your Unlock Verification Code',
  html: `<h1 style="text-align: center;">Your Unlock Login Verification Code</h1>
    
    <p>Hello!</p>

    <p>To continue logging into your Unlock account, please use the following verification code:</p>

    {{verificationCode code}}

    <p>This code expires in 10 minutes. Do not share this code with anyone. Please enter it promptly on the login page.</p>

    <p>If you did not attempt to log in to your Unlock account, please ignore this email or contact support if you believe this is an unauthorized attempt.</p>

    <p>Thank you for using Unlock!</p>
`,
}
