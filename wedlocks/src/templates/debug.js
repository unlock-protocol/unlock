export default {
  subject: () => 'Debug Email',
  text: (params) =>
    `Welcome to Unlock!
This is a test email. Please ignore and/or report if you're getting it!
  ${params.foo}
The Unlock team
  `,
}
