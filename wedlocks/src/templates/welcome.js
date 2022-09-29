import handlebars from 'handlebars'

export default {
  subject: handlebars.compile(
    'Welcome to Unlock! Please, read this email carefuly'
  ),
  html: handlebars.compile(
    `<h1>Welcome to Unlock!</h1> 
    
    <p>We're excited to have you with us!</p>

    <p>Unlock is designed to make sure <strong>we can never access your data</strong>: it's encrypted with your password. Because of that, we can't reset your password like other services that you're used to.</p>

    <p>We know that sometimes things happen, and you may find that you need to reset your password in the future. To do that, you will need <a href="{{recoveryLink}}">click on this link</a>. (we're also adding a text version of the link that you can copy paste at the bottom of this email.</p>

    <p>Please, make sure to <strong>keep this link secret</strong>: do not forward this email to anyone. If someone accesses this email, they will be able to take over your Unlock account and all associated memberships.</p>

    <p>It is important that you never lose this link, as <strong>you cannot reset your password without this recovery link</strong>.</p>

    <code>
    <small>
    {{recoveryLink}}
    </small>
    </code>
`
  ),
}
