export MESSAGE="Production $PROD_DEPLOY_TYPE Deploy $BRANCH

This is a production deployment. Please treat with great caution!
This deploys the code from master as of commit $COMMIT_TO_DEPLOY.

Reviewing code for this Pull Request is not practical, however, you are asked to check wether the current staging environment is stable and could be released. For this, follow these steps:

* [ ] This pull request has no conflicts with the \`production\` branch.
* [ ] Go to http://staging.unlock-protocol.com/ and ensure that the website loads fine.

## Creator Dashboard
* [ ] Click on the \"Go to your Dashboard\" button and ensure that the dashboard loads as expected
* [ ] Create a new Lock (you will need some Rinkeby Eth) and wait for it to confirm with the right values
* [ ] Update the price on this new lock or an older lock

## Paywall
* [ ] Go to https://www.ouvre-boite.com/members-staging/ and make sure the paywall is in place (no scrolling)
* [ ] Purchase a key and ensure that the optimistic paywall lets you access the content (scrolling works)
* [ ] Wait 5 minutes (the key should expire) and reload the page
* [ ] Purchase another key

## Tickets
* [ ] Go to https://tickets-staging.unlock-protocol.com/ and create or update a existing event
* [ ] Once saved, click on the event link and make sure it shows the right information
* [ ] Go to https://tickets-staging.unlock-protocol.com/event/0x3745FaFb818018dC9b4AE33Da2C1d169cfcd2D1A and purchase a ticket for this event
* [ ] Once purchased, the UI should show a QR code, along with a form to receive it by enail
* [ ] Send yourself an email and make sure the QR code is attached

Feel free to test the dashboard, paywal and tickets app using a mobile browser.
"
