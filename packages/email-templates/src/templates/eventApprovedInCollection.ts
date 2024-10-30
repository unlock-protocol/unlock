export default {
  subject:
    'Your Event "{{eventName}}" has been Approved for "{{collectionName}}"',
  html: `<h1>Event Approved</h1>

  <p>
    Congratulations! Your event "<strong>{{eventName}}</strong>" has been approved and added to the "<strong>{{collectionName}}</strong>" collection.
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    You can view your event in the collection and share the collection link to promote your event.
  </p>

  <p>
    <a href="{{collectionUrl}}">View the Collection</a>
  </p>

  <p>
    If you have any questions or need further assistance, reply to this email.
  </p>
  `,
}
