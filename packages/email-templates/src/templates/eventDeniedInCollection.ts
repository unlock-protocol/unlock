export default {
  subject:
    'Your Event "{{eventName}}" was Not Approved for "{{collectionName}}"',
  html: `<h1>Event Submission Update</h1>

  <p>
    Unfortunately, your event "<strong>{{eventName}}</strong>" was not approved for the "<strong>{{collectionName}}</strong>" collection.
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    Thank you for your interest in contributing to our collection.
  </p>
  `,
}
