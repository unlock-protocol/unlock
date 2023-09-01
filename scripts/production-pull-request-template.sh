export MESSAGE="Production $PROD_DEPLOY_TYPE Deploy $BRANCH

This is a production deployment. Please treat with great caution!
This deploys the code from the *master* branch as of commit $COMMIT_TO_DEPLOY.

Reviewing this Pull Request's code is impractical; however, you are asked to check whether the current staging environment is stable and could be released. For this, follow these steps:

* [ ] The staging environment has been fully deployed
* [ ] This pull request has no conflicts with the \`production\` branch.
* [ ] Go to http://staging.unlock-protocol.com/ and ensure that the website loads fine.

## Creator Dashboard
* [ ] Click on the \"Go to your Dashboard\" button and ensure that the dashboard loads as expected
* [ ] Create a new Lock (using a test net is the best option) and wait for it to confirm with the right values
* [ ] Update the price on this new lock or an older lock
* [ ] Enable credit cards on one of your locks
* [ ] Withdraw funds on one of the locks

## Paywall
* [ ] From the dashboard, open the Demo on one of your locks
* [ ] Purchase a key to the lock using your crypto wallet
* [ ] Make sure the content gets unlocked (is shown)
* [ ] Refresh the page and make sure the content is still unlocked

## Purchase URL
* [ ] From the dashboard, create a purchase URL (redirect URL does not matter)
* [ ] In the purchase URL, configure metadata collection to collect an email address, as well as at least one other `type` of data
* [ ] By using a recent lock, enable multiple purchases in the URL
* [ ] Go through the checkout flow and ensure that it works as expected (data is collected for 2 users + and 2 keys are minted)


## Verification 
* [ ] Add a separate address as a verifier
* [ ] Create QR code for one of the valid NFT you own and check in using your phone or laptop camera
* [ ] Check if metadata is displayed when you are a verifier and check-in is persistent from the members' page.

# Payments methods
## Credit Card flow for Unlock User accounts
* [ ] Open the demo for a lock that has credit card enabled
* [ ] Follow the steps to unlock using a credit card as a new user
* [ ] Make sure unlocking works successfully
* [ ] Connect to the keychain using your Unlock credentials
* [ ] Ensure the key you just purchased is there

## Swap & purchase
* [ ] Update the currency for a lock (e.g. USDC) to enable swap & purchase 
* [ ] Open the demo for the lock with the updated currency
* [ ] Make sure that swap & purchase is enabled as payment method
* [ ] Use swap and purchase and make sure that unlocking works successfully

## Custom credit card price
* [ ] Open settings for a lock and go to "payments."
* [ ] Enable custom credit card and set a fixed price
* [ ] Go through the checkout flow and ensure that the custom price correctly shows as the price for the lock
* [ ] Make sure that purchase with custom price works successfully
"


