export default {
  subject:
    'The event "{{eventName}}" was not approved for "{{collectionName}}"',
  html: `<h1>Event Submission Update</h1>

  <p>
    Unfortunately, the event "<strong>{{eventName}}</strong>" was not approved for the "<strong>{{collectionName}}</strong>" collection.
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    Thank you for your interest in contributing to this collection.
  </p>
  `,
}
