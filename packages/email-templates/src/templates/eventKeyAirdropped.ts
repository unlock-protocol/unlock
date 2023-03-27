import handlebars from 'handlebars'
import {
  customContentStyle,
  eventDetailStyle,
} from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: `Your ticket for {{lockName}}`,
  html: `<h1>A NFT ticket for "{{lockName}}" was airdropped to you!</h1>
<p>Your NFT ticket (#{{keyId}}) for the event <strong>{{lockName}}</strong> was just airdropped!</p>

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

<p>You can transfer it to your own wallet by going to <a href="{{transferUrl}}">here</a>. You can also print the ticket to this email.</p>

{{links txUrl openSeaUrl true}}
`,
}
