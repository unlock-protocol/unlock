export default {
  subject: 'New event "{{eventName}}" submitted to "{{collectionName}}"',
  html: `<h1>New Event Submitted</h1>

  <p>
    A new event titled "<strong>{{eventName}}</strong>" has been submitted to the "<strong>{{collectionName}}</strong>" collection.
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    Please review and approve or reject the event.
  </p>

  <p>
    <a href="{{collectionUrl}}">Go to the collection dashboard</a>
  </p>

  <p>
    Need assistance? Reply to this email, and we’ll be happy to help.
  </p>
  `,
}
