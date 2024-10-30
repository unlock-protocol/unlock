export default {
  subject:
    'Your Event "{{eventName}}" has been Submitted to "{{collectionName}}"',
  html: `<h1>Event Submission Received</h1>

  <p>
    Thank you for submitting your event "<strong>{{eventName}}</strong>" to the collection "<strong>{{collectionName}}</strong>".
  </p>

  {{eventDetailsLight
    eventName
    eventDate
    eventUrl
  }}

  <p>
    Your event is now pending approval. You will receive a notification once it has been reviewed.
  </p>


  <p>
    If you have any questions, feel free to reply to this email.
  </p>
  `,
}
