import handlebars from 'handlebars'
import {
  customContentStyle,
  eventDetailStyle,
} from './helpers/customContentStyle'
import { links } from './helpers/links'
import { transactionLink } from './helpers/transactionLink'

handlebars.registerHelper('links', links)
handlebars.registerHelper('transactionLink', transactionLink)

export default {
  base: 'events',
  subject: `Here is your ticket!`,
  html: `<h1>Here's your ticket</h1>

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

{{transactionLink transactionReceiptUrl}}

`,
}
