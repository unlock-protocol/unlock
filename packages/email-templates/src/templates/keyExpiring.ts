import { customContentStyle } from './helpers/customContentStyle'

export default {
  subject: 'Your "{{lockName}}" membership is about to expire!',
  html: `<h1>Your Membership NFT is expiring!</h1>

<p>Your <strong>{{lockName}}</strong> membership (#{{keyId}}) is expiring!</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

{{#if isRenewable}}
<p>You can renew the duration from <a href="{{keychainUrl}}">Unlock Keychain</a>, so you don't lose any benefit.</p>
<p>By renewing the duration, the Key's expiration date is extended so the Key is considered valid for a longer duration.</p>
{{/if}}
`,
}
