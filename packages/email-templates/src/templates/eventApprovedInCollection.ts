export default {
  subject:
    'The event "{{eventName}}" has been approved for "{{collectionName}}"',
  html: `<h1>Event Approved</h1>

  <p>
    Congratulations! The event "<strong>{{eventName}}</strong>" has been approved and added to the "<strong>{{collectionName}}</strong>" collection.
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    You can view this event in the collection and share the collection link to promote the event.
  </p>

  <p>
    <a href="{{collectionUrl}}">View the collection</a>
  </p>

  <p>
    If you have any questions or need further assistance, reply to this email.
  </p>
  `,
}
