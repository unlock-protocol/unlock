---
title: Discount Codes
subTitle: Unlocking the Power of Membership Savings
authorName: Julien Genestoux
publishDate: January 16, 2024
description: 'Unlock Labs introduces a new couponing and discount feature to delight your members with customizable discounts.'
image: /images/blog/promo-codes/coupon-code.png
---

![Coupon code](/images/blog/promo-codes/coupon-code.png)

A little over a year ago, we introduced a [Hook to add discount codes to Unlock membership contracts](https://unlock-protocol.com/blog/discount-codes). Today we’re proud to introduce the next iteration of this Hook, as well as a brand new UI for both managers and members!

First, let’s dive a bit into one of my favorite features of the PublicLock contract (the Unlock Protocol membership smart contract): **Hooks**. Generally, code hooks are like triggers or signals in a computer program that allow different parts of the program to communicate and work together.

Smart contracts are onchain programs, and the membership contract includes several hooks that can be triggered. The PublicLock contract has a hook called `onKeyPurchaseHook` that is triggered when the purchase function is called. This hook can be used to alter the behavior of the membership contract when a membership key is purchased. For example, the hook can do things like dynamically change the price that a user needs to pay to purchase an onchain membership as well as a wide variety of other related checkout behaviors.

The Unlock Labs team has created several hooks, include a Discount Code Hook. A Lock Manager can use this hook add discount codes (like `PROMO30` or `FRIEND&FAM` to their contract) and set a percentage-off associated with each discount code. These discount percentages can range from 0% to 100% (and anything in between). A Lock Manager can also set a “cap”, or a maximum number of uses for a particular discount code, like 10 or 300, after which the discount will no longer be applied!

## Configuring a discount code

A new section has been added to the `Advanced > Hooks` section of the Unlock Dashboard for discount codes. To add a discount code for a particular lock, select `Discount code` from the dropdown in `Advanced > Hooks`, enter the discount code you want to add (e.g. `HAPPYBIRD`), the corresponding percentage discount that customers will receive when using that discount code, and maximum number of uses. Then click `Add`.

![Manage discount codes](/images/blog/promo-codes/manage-discount-codes.png)

_The Discount Code hook configuration interface_

The smart contract will update to recognize the discount that will be applied when a customer enters the new discount code during checkout.

## How the discount code hook works at checkout

At checkout time, the Unlock checkout will automatically identify that a membership contract is using the discount code hook, and will show an additional screen as part of the checkout to let soon-to-be members enter a promo code. The checkout UI will also instantly show a visual confirmation of the discount applicable!

![Screenshot 2024-01-15 at 5.16.20 PM.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/aa493f73-7575-471f-b652-ac6b67d6530c/2262a5c8-5e8a-470a-b4b1-2d66030e1a2c/Screenshot_2024-01-15_at_5.16.20_PM.png)

![Checkout discount codes](/images/blog/promo-codes/checkout-discount-code.png)

## Wrapping up

The new Discount Code Hook for Unlock membership contracts offers an new way for Lock Managers to provide discounts to their users. By configuring discount codes with specific percentages and maximum usage limits, Lock Managers can customize the membership experience and incentivize new users to join. With the updated UI for both managers and members, the checkout process becomes seamless and visually confirms the applicable discount.

Unlock continues to enhance the membership contract with powerful hooks like the Discount Code Hook, making it easier than ever to manage and promote memberships and subscriptions onchain!
