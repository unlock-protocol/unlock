import { customContentStyle } from './helpers/customContentStyle'

export default {
  subject: 'Your "{{lockName}}" membership is expired!',
  html: `<h1>Your Membership NFT is expired!</h1>

<p>Your <strong>{{lockName}}</strong> membership (#{{keyId}}) has now expired.</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<p>You can extend it directly from the <a href="{{keychainUrl}}">Unlock Keychain</a>, so you don't lose any benefit.</p>
`,
}
