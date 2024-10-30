export default {
  subject: 'Your Event Collection "{{collectionName}}" is Live!',
  html: `<h1>Your Event Collection is Live!</h1>

  <p>
    <strong>Congratulations!</strong> Your event collection "{{collectionName}}" has been successfully created. Start sharing it with your community and adding events.
  </p>

  {{collectionDetailsLight
    collectionName
    collectionUrl
  }}

  <p>
    Next Steps:
  </p>

  <ul>
    <li><strong>Share Your Collection</strong><br>
    Use this link to share your collection: <a href="{{collectionUrl}}">{{collectionUrl}}</a></li>

    <li><strong>Customize Settings</strong><br>
    Update the description, images, and social links in your collection settings.</li>

    <li><strong>Add Events</strong><br>
    Add new events by creating them, using existing event URLs, or selecting from your existing events.</li>

    <li><strong>Manage Contributors</strong><br>
    Assign additional managers to help curate and approve events.</li>
  </ul>

  <p>
    Need assistance? Reply to this email, and we’ll be happy to help.
  </p>
  `,
}
