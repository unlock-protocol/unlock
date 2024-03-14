---
title: RSVP Event Approval
subTitle: Attendee approval is now live in EVENTS by Unlock Labs.
authorName: Julien Genestoux
publishDate: January 30, 2024
description: 'Attendee approval is now live in EVENTS by Unlock Labs.'
image: /images/blog/rsvp-approval/rsvp-approval.png
---

![RSVP Approval](/images/blog/rsvp-approval/rsvp-approval.png)

Tickets to events and conferences are memberships! The Unlock Protocol is used to create [all](https://www.coinage.media/trial/mint) [kinds](https://boardroom.io/discuss?nftModal=true) of [memberships](https://dirt.fyi/), so we built a simple-to-use [ticketing and event application](https://events.unlock-protocol.com/) to showcase how the protocol can be used!

Our event app has now been used for all kinds of events, from large conferences ([EthCC](https://unlock-protocol.com/blog/ethcc5-2022-ticketing) , [Dappcon](https://2023.dappcon.io/), [EthMexico](https://ethmexico.org/), [EthTaipei](https://2023.ethtaipei.org/)…) to [small side gatherings](https://app.unlock-protocol.com/event/myosin-x-unlock-dinner-party). Organizers can use it for paid events, or free events.

One of the features that many organizers have asked us to add is the ability to “approve” attendees, rather than just let everyone attend. Today we’re excited to announce that this is now a feature that we fully support!

Here is a quick flow. [When creating your event](https://app.unlock-protocol.com/event/new), please make sure you toggle the “attendee screening” option.

![Screening](/images/blog/rsvp-approval/screening.png)

Under the hood you will deploy a new NFT membership contract, for which NFTs tickets can only be distributed by the event organizer. (Technically, there is a supply of “0” for “self-serve” minting.) This means that you alone can create and “airdrop” NFT tickets to the attendees your approve — attendees are not able to mint their own tickets without your approval.

When going to your event’s page, attendees will see the following message:

![RSVP](/images/blog/rsvp-approval/rsvp.png)

(You can also customize the fields displayed here, but that’s for another post!)

At that point, attendees can “apply” by submitting their email address, full name and, if they want, their wallet addresses. When they RSVP, they receive an email to confirm that they are on the list and will hear back from the organizers if they are approved.

As an organizer, you can then view the list of attendees, as well as the list of people who have applied to attend.

![approval](/images/blog/rsvp-approval/approval.png)

For each of these, you can approve or deny them. When you approve an attendee, they will receive an email with a QR code ticket attached and the event’s details.

![confirm](/images/blog/rsvp-approval/confirm.png)

Denied users can still be approved later as well.

![deny](/images/blog/rsvp-approval/deny.png)

We’re excited to build the “membership” graph through events and tickets!
