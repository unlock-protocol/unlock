export default {
  subject: 'Your event {{eventName}} is live onchain!',
  html: `<h1>You are invited to {{eventName}}!</h1>

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
<li>💬 Share a Link<br>
The public link to your event is {{eventUrl}}.</li>

<li>🎨 Update settings!<br>
Update the description, time, location, set images... </li>

<li>💁 Attendees<br>
Approve and view attendees in the dashboard.</li>

<li>📱 Learn how to check people in<br>
Each attendee will receive a QR code to check in at the event. 
</li>
</ul>

<p>
Have questions? Reply to this email 😎.
</p>

`,
}
