import handlebars from 'handlebars'
import {
  customContentStyle,
  eventDetailStyle,
} from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: `Your ticket for {{lockName}}`,
  html: `<h1>A NFT ticket for "{{lockName}}" was added to your wallet!</h1>
<p>Your NFT ticket (#{{keyId}}) for the event <strong>{{lockName}}</strong> was just minted!</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<div style="${eventDetailStyle}">
  <h2>Event details</h2>
  {{#if eventDescription}}
    <p>{{eventDescription}}</p>
  {{/if}}

  {{#if eventDate}}
    <div>
      <strong>Date:</strong> {{eventDate}}
    </div>
  {{/if}}

  {{#if eventTime}}
    <div>
      <strong>Time:</strong> {{eventTime}}
    </div>
  {{/if}}

  {{#if eventAddress}}
    <div>
      <strong>Location:</strong>
      <a target="_blank" href="https://www.google.com/maps/search/?api=1&query={{eventAddress}}"> 
        {{eventAddress}}
      </a>
    </div>
  {{/if}}
</div>

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>

{{links txUrl openSeaUrl true}}

{{#if transactionReceiptUrl}}
<small><a href="{{transactionReceiptUrl}}">Transaction Receipt</a></small>
{{/if}}
`,
}
