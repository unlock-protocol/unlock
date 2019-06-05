# Rover

Rover provides an easy way to receive on chain data regarding transactions of given addresses. It should be noted that this is to address relatively lowscale data needs quickly with out standing up a lot of infrastruture. 

How does it work?

1. Addresses to be observed are registered with the application
2. Upon registration a backfill request of all the registrant's transactions will be made.

In parallel as new blocks are mined, Rover is notified and will filter transactions relevant to addresses in the registry.  The current iteration of the software persists relevant transactions to a postgres database.

## Under the Hood

Rover is a small Typescript application, leveraging ethers.js and typeorm for Ethereum chain concerns and peristance concerns respectively.