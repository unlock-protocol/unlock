import confirmEvent from '../../templates/confirmEvent'

describe('confirmEvent', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      confirmEvent.subject({
        eventName: 'The Tupperware Party',
      })
    ).toBe("You've got your ticket for The Tupperware Party!")
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      confirmEvent.text({
        eventName: "Unlock's launch party!",
        eventDate: 'June 6th 2019',
        ticketLink:
          'https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4',
      })
    ).toBe(
      `Hello,

This is just a reminder that you are attending the event Unlock's launch party! on June 6th 2019!

When you're asked for your ticket at the door, simply show the QR code attached to this email. Alternately, you can click the following link and open it using your crypto-enabled web browser or Unlock user account.

https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4

Enjoy!

The Unlock team
`
    )
  })

  it('should have the right text for ETHWaterloo', () => {
    expect.assertions(1)
    expect(
      confirmEvent.text({
        eventName: 'ETHWaterloo',
        eventDate: 'June 6th 2019',
        ticketLink:
          'https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4',
      })
    ).toBe(
      `Hello,

This is just a reminder that you are attending the event ETHWaterloo on June 6th 2019!

After you check in to ETHWaterloo we'll refund your stake in DAI. If you are an Unlock account user, you'll be able to access those funds once you eject your Unlock account into a crypto wallet. We'll provide more details on that process soon! Note that this event ticket is non-transferable.

When you're asked for your ticket at the door, simply show the QR code attached to this email. Alternately, you can click the following link and open it using your crypto-enabled web browser or Unlock user account.

https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4

Enjoy!

The Unlock team
`
    )
  })
})
