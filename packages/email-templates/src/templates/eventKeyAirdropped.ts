import handlebars from 'handlebars'
import {
  customContentStyle,
  eventDetailStyle,
} from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  base: 'events',
  subject: `Here is your ticket!`, // using {{{}}} prevents HTML escaping
  html: `<h1>Here is your ticket</h1>

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

  {{#if lockName}}
    <div>
      <strong>Ticket:</strong> {{lockName}}
    </div>
  {{/if}}

  {{#if keyId}}
    <div>
      <strong>Ticket #</strong> {{keyId}}
    </div>
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

<p>You can view your ticket online <a href="{{keychainUrl}}">here</a>.</p>

<p>You can transfer it to your own wallet by going to <a href="{{transferUrl}}">here</a>. You can also print the ticket attached to this email.</p>

{{links txUrl openSeaUrl true}}

{{transactionLink transactionReceiptUrl}}

`,
}
