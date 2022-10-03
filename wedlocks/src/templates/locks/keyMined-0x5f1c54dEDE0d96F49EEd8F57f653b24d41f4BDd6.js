// GUEST MAIL TEMPLATE 
export default {
  nowrap: true,
  subject: 'You are going to LaDegen!',
  html: `
<div style="text-align: center">
  <img width="200px;" src="{{inlineImage 'bomdia.png'}}" /><br>
  <img width="600px;" src="{{inlineImage 'postcard-degen.png'}}" />
  <p>
    You'll recognize me thanks to my red scarf at my neck<br>The 3rd of Nov I'll be in the Suspenco in Alfama at 10PM<br>
    <a target="_blank" href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20221103T220000Z%2F20221104T040000Z&location=Suspenso%2C%20Lisbon&text=La%20Degen%20-%20Bom%20Dia%20">Add it to your calendar</a><br>Your ticket is attached to this email, don't lose it!
  </p>
  <img width="200px;" src="{{inlineImage 'ladegen.png'}}" />
</div>
  `,
}
