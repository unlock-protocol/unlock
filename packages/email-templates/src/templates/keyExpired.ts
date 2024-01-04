import Handlebars from 'handlebars'

import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: 'Your "{{lockName}}" membership has expired!',
  html: `<h1>Your Membership NFT is expired!</h1>

<p>Your <strong>{{lockName}}</strong> membership (#{{keyId}}) has now expired.</p>

{{formattedCustomContent "Membership Manager" customContent}}

<p>You can extend it directly from the <a href="{{keychainUrl}}">Unlock Keychain</a>, so you don't lose any benefit.</p>
`,
}
