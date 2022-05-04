export MESSAGE="Production $PROD_DEPLOY_TYPE Deploy $BRANCH

This is a production deployment. Please treat with great caution!
This deploys the code from master as of commit $COMMIT_TO_DEPLOY.

Reviewing code for this Pull Request is not practical, however, you are asked to check wether the current staging environment is stable and could be released. For this, follow these steps:

* [ ] The staging environment has been fully deployed
* [ ] This pull request has no conflicts with the \`production\` branch.
* [ ] Go to http://staging.unlock-protocol.com/ and ensure that the website loads fine.

## Creator Dashboard
* [ ] Click on the \"Go to your Dashboard\" button and ensure that the dashboard loads as expected
* [ ] Create a new Lock (rinkeby is the best option) and wait for it to confirm with the right values
* [ ] Update the price on this new lock or an older lock
* [ ] Enable credit cards on one of your locks
* [ ] Withdraw funds on one of the locks

## Paywall
* [ ] From the dashboard open the Demo on one of your locks
* [ ] Purchase a key to the lock using your crypto wallet
* [ ] Make sure the content gets unlocked (is shown)
* [ ] Refresh the page and make sure the content is still unlocked

## Purchase URL
* [ ] From the dashboard, create a purchase URL (redirect URL does not matter)
* [ ] In the purchase URL, configure metadata collection to collect an email address (\`\"metadataInputs\": [ { name: 'Name', type: 'text', required: true } ],\`)
* [ ] By using a v10 lock, enable multiple purchase in the URL (\`\"maxRecipients\": 6\`)
* [ ] Go through the checkout flow and ensure that it works as expected (data is collected for 2 users + and 2 keys are minted)

## Credit Card flow for Unlock User accounts
* [ ] Open the demo for a lock that has credit card enabled
* [ ] Follow the steps to unlock using a credit card as a new user
* [ ] Make sure unlocking works successfuly
* [ ] Connect to the keychain using your Unlock credentials
* [ ] Ensure the key you just purchased is there

"
