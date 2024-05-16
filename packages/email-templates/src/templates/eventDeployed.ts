export default {
  subject: 'Your event {{eventName}} is live onchain!',
  html: `<h1>Your event is live onchain!</h1>

<p>
  <strong>Congratulations</strong>! Now, it's time to share your beautiful new event page and invite attendees to RSVP!
</p>

{{eventDetailsLight 
  eventName
  eventDate
  eventTime
  eventUrl
}}

<p>
What's next?
</p>

<ul>
<li><strong>💬 Share a Link</strong><br>
The public link to your event is {{eventUrl}}.</li>

<li><strong>🎨 Update settings!</strong><br>
Update the description, time, location, set images... </li>

<li><strong>💁 Attendees</strong><br>
Approve and view attendees in the dashboard.</li>

<li><strong>📱 Learn how to check people in</strong><br>
Each attendee will receive a QR code to check in at the event. 
</li>
</ul>

<p>
Have questions? Reply to this email 😎.
</p>

`,
}
