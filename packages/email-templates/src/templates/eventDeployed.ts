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

What's next?

💬 Share a Link
The public link to your event is {{eventUrl}}.

🎨 Customize Your Event
Update the description, add questions for your guests, update security settings, and more. Visit the Manage Event page.

🎟 Sell Tickets
You can hook up your bank account and start selling tickets to your event in under 5 minutes. Set up tickets.

📱 Download the Check In App
Scan your guests' QR codes quickly and easily.

Download on the App Store
Get it on Play Store
Have questions? Reply to this email 😎.

Happy hosting!

`,
}
