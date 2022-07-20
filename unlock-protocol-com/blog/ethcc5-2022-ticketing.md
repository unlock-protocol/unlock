---
title: Ticketing with Unlock Protocol at EthCC 2022
subTitle: Behind the scenes on how Unlock handled NFT ticketing for the largest European Ethereum event with 1800 attendees
authorName: Christopher Carfi
publishDate: July 30, 2022
description: Behind the scenes on how Unlock handled NFT ticketing for the largest European Ethereum event with 1800 attendees.
image: /images/blog/ethcc5/ethcc-stage.png
---

Now in its fifth year, the Ethereum Community Conference (EthCC [5]) is the largest annual European Ethereum event focused on technology and community, consisting of three intense days of conferences, networking and learning. 

With over 1800 attendees in 2022, EthCC is the premier European event for the Ethereum community. It is held at the historic Maison de la Mutualité, and EthCC prides itself on a flawless experience for attendees, sponsors, speakers, and all other members of its community.


![maison-de-la-mutau.jpg](/images/blog/ethcc5/maison-de-la-mutau.jpg)

_Image source: [Wikipedia](https://fr.wikipedia.org/wiki/Maison_de_la_Mutualit%C3%A9#/media/Fichier:DSC_7088-Maison-de-la-Mutau.jpg)_

The first impression of any conference participant is the ticketing and check-in experience. The ticket purchase experience needs to be straightforward, and the check-in process at the venue itself needs to be fast and efficient. Other conferences in the crypto space have been plagued with blocks-long queues for entrance, resulting in hours-long wait times to get into the venue for some attendees. EthCC was committed to living up to its reputation and was committed to having the smoothest check-in experience for all its stakeholders.

As an Ethereum technology conference, EthCC knew they needed to offer their community not only a flawless ticketing process, but a crypto-native ticketing experience as well. Tickets needed to be purchasable either in crypto or in fiat, and needed to be represented by NFTs. 

In 2022, EthCC partnered with Unlock Labs and used Unlock Protocol to create its ticketing experience, based on Unlock’s long track record of providing membership solutions based on blockchain technology.

## A complex ticketing landscape

There were over 1800 individuals registered for EthCC 2022. Not only were there a huge number of attendees, there were also different types of tickets within that group. As opposed to events that have a single “general admission” ticketing tier, EthCC wanted to specialize their ticketing based on attendee type. Tickets for EthCC were segmented into a number of categories based on the role of the attendee. These included:

* General admission
* Sponsors
* Speakers
* Investors
* Students
* Press

Each of these different types of attendees required a different ticket type, which would specialize their experience throughout EthCC.

## Phased ticket sales

Tickets for EthCC were sold through the EthCC website in multiple waves or batches, with each batch containing several dozen to several hundred tickets. When a new wave of tickets went on sale, purchasers would flock to the EthCC website to purchase their tickets. Most batches sold out in just a few minutes.

From the user’s point of view, purchasing a ticket followed a familiar online e-commerce checkout flow. However, for each ticket sale, the front-end simplicity of the checkout experience was backed by a complex bit of choreography between the user’s crypto wallet, the smart contract that issued the tickets, and potentially a credit card gateway (for purchases where tickets were purchased with a credit card). In particular, not only did the payment need to successfully complete, but as soon as the transaction was successfully completed, the smart contract handling the ticketing needed to mint and transfer an NFT ticket into the user’s crypto wallet. This process happened almost instantaneously, and Unlock shielded the user from this complexity.

Also, EthCC had a requirement to make these NFT tickets “non-transferable,” as a mechanism to reduce the probability of ticket scalping or other malicious activity that could result from ticket transfers for this in-demand event. 

Associated with each ticket, EthCC wanted to collect a number of pieces of metadata, including the attendee’s name, the ticket number, the ticket type, the ticket purchase date, as well as other metadata.

## Ticket delivery to attendees

Since the NFT tickets were delivered directly to attendee’s crypto wallets, attendees were in control of their tickets. However, at the venue itself, tickets would need to be quickly checked for validity. Unlock provides a one-click method to render an NFT as a QR code for users with a moderate level of skill and experience.

Even with the mechanisms natively included in Unlock Protocol, EthCC wanted an additional simple, familiar way for attendees to access their tickets: email. To address this need, Unlock Labs developed a process to email a unique QR code ticket to every attendee prior to the event. This QR code represents a link to the NFT and scanning the QR code decodes the ticket metadata, including the ticket type, ticket number, and other identifying information. Using a transactional email system, QR code tickets and check-in instructions were sent to all attendees prior to the event. Attendees would then simply need to show the QR code attached to a familiar email experience to gain entrance to the venue.

![ticket-qr-code.png](/images/blog/ethcc5/ticket-qr-code.png)

## Preparing for check-in at the event

With over 1800 attendees registered for the event, the EthCC and Unlock Labs teams knew the check-in process at the venue itself needed to be simple, seamless, and incredibly efficient. Even a few seconds delay in checking in each attendee could cascade and potentially result in hours of overall delay and inconvenience for attendees waiting in line to check in to the venue. (For example, a back-of-the-envelope calculation of a one minute check-in time per attendee for 1800 attendees would be 1800 minutes, or approximately 30 hours, to check in all attendees. This would be unacceptable, obviously.)

To provide a positive check-in experience for attendees, EthCC wanted to ensure that, even in the case where all attendees showed up at the same time, they wanted the overall wait time for entrance to the venue to be under one hour for all 1800 attendees. To achieve this, the goal was to set up at least ten concurrent check-in stations, as well as a requirement to have a check-in solution through which each attendee could be checked-in in under fifteen seconds, including checking each NFT ticket for validity and ensuring each ticket had not already been checked-in. There was also the goal to give the attendee their conference wristband and hand them their bag full of sponsor swag also within that fifteen second window.

## The check-in mobile app

After exploring several potential approaches, the Unlock Labs team created a web-based check-in application that uses a standard mobile phone camera and a default mobile browser (e.g. Safari, Chrome, Brave, etc.) to scan the QR codes and check EthCC tickets for validity. Since this application is browser-based and can use any standard mobile phone, a cohort of ten EthCC volunteers would be able to use the application on their individual mobile devices to check-in attendees and meet the overall performance goal that was required in order to ensure a pleasant attendee check-in experience at the event. The application was designed to be very straightforward to use, and the volunteers were trained on how to use the application in less than five minutes.

The ticket scanner application developed by Unlock Labs returns one of a number of potential results for every ticket scan. The result of a scan can be:

* The ticket is ok and valid
* The ticket has already been checked in (i.e. someone is trying to recycle a ticket)
* The ticket is not valid (e.g. expired, inauthentic, or some other exception)

![two-phones-min.png](/images/blog/ethcc5/two-phones-min.png)

Attendees who presented tickets that were ok and valid were granted admittance to the venue. If there was an exception thrown during the check-in process, the attendee was referred to a help desk that had an offline list of all valid tickets and their associated attendee name and metadata for issue resolution.

## What happened when the doors opened at EthCC [5]?

Once the doors opened at EthCC, the check-in process went smoothly. Volunteer expediters interacted with each attendee before they got up to the check-in booth to ensure the attendee had their QR code email and directed them to the appropriate check-in station (e.g. sponsor, speaker, general attendee, etc.).

On average, the check-in process — including ticket scanning and verification, handing the wrist band to the attendee, and giving them their sponsor swag bag — took less than fifteen seconds (and sometimes fewer than seven seconds) per attendee. All the attendees who showed up (over 1000!) with valid tickets were checked in using the application in the first hour by the volunteers, and no attendee waited outside the venue for more than a few moments before being directed to a check-in station.

![checkin1-min.png](/images/blog/ethcc5/checkin1-min.png)

_The doors are open_

![checkin2-min.png](/images/blog/ethcc5/checkin2-min.png)

_EthCC volunteers checking-in attendees_

![checkin3-min.png](/images/blog/ethcc5/checkin3-min.png)

_EthCC volunteers scanning a ticket_

![checkin4-min.png](/images/blog/ethcc5/checkin4-min.png)

_Patrick is ready to check in his next attendee_

![checkin5-min.png](/images/blog/ethcc5/checkin5-min.png)

_Wrist band bracelets_

![checkin6-min.png](/images/blog/ethcc5/checkin6-min.png)

_Wrist band color decoder_

<div style="position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;"><iframe style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/X8aBLbYbTos" title="Unlock Protocol EthCC Ticketing" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

_The live check-in experience_


## Conclusion: NFT ticketing with Unlock Protocol is ready for events with thousands of attendees

The experience at EthCC has shown that NFT-based ticketing with Unlock Protocol is ready for real-world use. From purchase through check-in, the process and technology work at scale to support large numbers of attendees and support concurrent use by multiple volunteers. 

![ethcc-stairway.png](/images/blog/ethcc5/ethcc-stairway.png)


## Addendum: How to deal with ticket scammers, scalpers, and other bad actors

Like any in-demand event, EthCC attracts actors who aim to exploit systems for their own gain. Through a number of technical architecture decisions and processes, Unlock Protocol makes things difficult for scalpers for scammers. These features include:

* A strong CAPTCHA at purchase time to deter bot purchases
* Non-transferable NFT tickets to deter aftermarket price inflation
* At-venue ticket verification to ensure tickets are authentic
* A real-time scan for double-use of tickets at check-in
