---
title: Unlock Launches Redesigned Membership Dashboard
subTitle: Unlock has a completely redesigned dashboard, focused on usability
authorName: Kalidou Diagne
publishDate: October 4, 2022
description: Unlock launched a completely redesigned membership dashboard, focused on usability.
image: /images/blog/dashboard-redesign/dashboard-share.png
---

Unlock continues to simplify and improve the user experience. With that goal in mind, Unlock has completely redesigned the Unlock Dashboard. The Dashboard is the key interaction point with Unlock Protocol for most users where they configure memberships, view their member information, and interact with the key functions of the Unlock smart contract and surrounding ecosystem.

There are three main sections to the Dashboard.

- Lock creation
- Lock listing
- Lock management

Let's see the details, step by step.

## Lock creation

The lock creation section of the Dashboard is where creators deploy new locks to create memberships for their community. The enhanced Dashboard takes a guided, step-by-step approach to lock creation.

In the first step, a form with the details to create a lock is shown to the user. The interface will indicate if a required field is missing before allowing the user to proceed to the next step. 

![Screenshot 2022-10-03 at 11.29.54.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_11.29.54.png)

The purchase (mint) price of membership NFTs can be priced in the native token of a blockchain, or can be priced using a token from a list of default ERC20 contracts. For pricing in custom ERC20s, the user can enter their own token address as well.

![Screenshot 2022-10-03 at 11.29.15.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_11.29.15.png)

After configuration, membership details are shown to double check if everything is correct before creating the smart contract for the lock.

![Screenshot 2022-10-03 at 11.31.11.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_11.31.11.png)

During the deployment, a block explorer link is shown to the user. The user can confirm the lock smart contract has been deployed on-chain via the block explorer.

![Screenshot 2022-10-03 at 11.32.26.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_11.32.26.png)

## Lock listing

In the new dashboard, locks are now grouped and displayed by network. This makes it easier for creators to see all their memberships and locks in one place in a greatly streamlined interface.

![locks-by-network.png](/images/blog/dashboard-redesign/locks-by-network.png)

When there are no locks to show on the listing page, the user will be redirected to the “Create lock” page.

 

![Screenshot 2022-09-27 at 11.06.44.png](/images/blog/dashboard-redesign/Screenshot_2022-09-27_at_11.06.44.png)

### Lock summary cards

Lock summary cards show the high-level information about the lock. Lock summary cards now have a new, cleaner interface and contain only the main high-level details for price, key duration, and key total for each lock. To dive into further details for a particular lock, clicking the arrow goes to the lock management page and shows further details for each lock.

![Screenshot 2022-10-03 at 12.11.08.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_12.11.08.png)

## Lock management

Clicking through on a lock summary card brings up the lock management screen, which surfaces the details for a particular lock. This page has been redesigned for simplicity and readability. 

On this page, the lock manager can update settings for the lock, as well as see a list of all the members.

### Customize NFT image

By clicking the NFT image, a popup will allow you to update the NFT image. This can be done by uploading a file or via a URL.

![Screenshot 2022-10-03 at 11.55.56.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_11.55.56.png)

### Edit duration, quantity, and price

Duration, quantity, or price information for a particular lock can be changed by clicking on the pencil next to the respective field in the left sidebar. Clicking the pencil to edit `Key Duration`, for example, will bring up a popup to edit the details of that field. By default, the current field value will be shown, which can then be edited. This same process works for updating `Quantity` and `Price` as well.

![update-price.png](/images/blog/dashboard-redesign/update-price.png)

### Members list

The lock management page displays a list of members for the current lock, as well as metadata such as the expiration time for a particular key.

![Screenshot 2022-10-03 at 12.04.31.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_12.04.31.png)

Clicking on a key will expand it, and shows basic information about the key, owner, and expiration status.

![Screenshot 2022-10-03 at 12.06.41.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_12.06.41.png)

 In addition, if the viewer is the lock manager, more details and metadata for the key are shown.

![Screenshot 2022-10-03 at 12.05.24.png](/images/blog/dashboard-redesign/Screenshot_2022-10-03_at_12.05.24.png)

### Withdrawing funds from a lock 

When the lock has a withdrawable amount, the `Withdraw` button will be active and allow the lock manager to withdraw the collected amount for the keys sold.

![withdraw-amount.png](/images/blog/dashboard-redesign/withdraw-amount.png)

### Generate purchase URL

By clicking the `Generate URL` button, the user can generate a URL that can be shared with fans and allow them to easily purchase this membership.

![generate-url.png](/images/blog/dashboard-redesign/generate-url.png)

## Mobile experience

The mobile experience is improved significantly with the new Dashboard. It features a fully responsive layout and provides a better experience and improved usability when using the app through a mobile device.

### Change network and header 

![mobile-header.png](/images/blog/dashboard-redesign/mobile-header.png)

### Lock listing page

![Screenshot 2022-09-28 at 13.16.57.png](/images/blog/dashboard-redesign/Screenshot_2022-09-28_at_13.16.57.png)

### Manage lock page

![manage-lock-mobile.png](/images/blog/dashboard-redesign/manage-lock-mobile.png)

**[Try out the new Dashboard](https://app.unlock-protocol.com/dashboard)**.

**What if I find an issue or bug in the new Dashboard?**

Please open an issue on Github or tell us in the Discord and we'll fix it ASAP.
