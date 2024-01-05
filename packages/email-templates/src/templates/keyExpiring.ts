import Handlebars from 'handlebars'

import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: 'Your "{{lockName}}" membership is about to expire!',
  html: `<h1>Your Membership NFT will expire soon</h1>

<p>Your <strong>{{lockName}}</strong> membership (#{{keyId}}) will expire on #{{expirationDate}}</p>

{{formattedCustomContent "Membership Manager" customContent}}

{{#if isRenewable}}
  <p>You can renew this membership from the <a href="{{keychainUrl}}">Unlock Keychain</a> so you don't lose any benefit.</p>
{{/if}}

{{#if isAutoRenewable}}
  <p>This membership will automatically renew, since your balance of {{currency}} is enough. You can cancel this renewal from the <a href="{{keychainUrl}}">Unlock Keychain</a>.</p>
{{/if}}

{{#if isRenewableIfRePurchased}}
  <p>This membership will not automatically renew because the membership contract terms have changed. You can approve the new terms from the <a href="{{keychainUrl}}">Unlock Keychain</a> so you don't lose any benefit.</p>
{{/if}}

{{#if isRenewableIfReApproved}}
  <p>This membership will not automatically renew because you have not approved enough {{currency}}. You can approve renewals from the <a href="{{keychainUrl}}">Unlock Keychain</a> so you don't lose any benefit.</p>
{{/if}}
`,
}
