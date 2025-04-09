export default {
  subject: 'New event in "{{collectionName}}" collection: "{{eventName}}"',
  html: `<h1>New Event Added to {{collectionName}}</h1>

  <p>
    Hello {{attendeeName}},
  </p>

  <p>
    A new event has been added to the "<strong>{{collectionName}}</strong>" collection that might interest you.
    Since you attended "<strong>{{pastEventName}}</strong>", we thought you'd like to know about this new event.
  </p>

  <h2>Event Details</h2>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    <a href="{{eventUrl}}">View event details</a> or <a href="{{collectionUrl}}">browse the collection</a> for more events.
  </p>

  <p>
    We hope to see you there!
  </p>
  
  <p><small>You're receiving this email because you attended a previous event in this collection. 
  If you prefer not to receive these notifications, please contact the collection manager.</small></p>
  `,
}
