---
title: Unlock Accounts
description: A guide to what are Unlock Accounts and how do they work.
---

# Unlock Accounts

We recognize that not every web user currently owns a crypto wallet. For that reason, our locks [can be connected to a Credit Card processor](https://unlock-protocol.com/guides/enabling-credit-cards/). In that situation, Unlock also offers "Unlock Accounts" to users who do not own their own wallet.

### How do they work?

Unlock account are _like_ regular accounts on any website. The user authenticates with an email and a password. In practice though, these accounts also come with their own Ethereum wallets, but users don't have to know about them.

#### Account creation

When the account is created, the front-end application generates a new unique private key for them. We then immediately encrypt the private key with the user's password (we require passwords to be fairly complex). We only store in our database the password-encrypted private key, which means that we don't have access to it.

Upon creation, our back-end also creates a unique recovery phrase that's stored in our database. This unique recovery phrase is then sent to the front-end so it can be used to encrypt the private key again. The resulting encrypted private key is then sent by email to the user has a mechanism to recover their private key should they have forgotten their password.

#### Authenticating

When the user authenticates with an Unlock account, they are prompted for their email and passwords. Once the email is known, we use it to retrieve the password encrypted private key (the password is _never_ sent to our backend).&#x20;

Once the encrypted private key has been served to the frontend, our application tries to decrypt it with the user's password. If the decryption works, then the user is authenticated. If it fails, then we know this is not the right password.

#### Forgotten password

Users will forget their passwords. In that scenario, they can easily use the recovery link that was sent to them by email upon sign-up. Once they have loaded the recovery link, our front-end application will load their unique recovery phrase from our backend and, similarly to the authentication flow, we will decrypt the recovery-phrase-encrypted private key.

Once decrypted, the user is prompted to set a new password (and confirm it). We then proceed to a flow similar to the one used for sign-up.

### Security considerations

Unlock accounts should NOT be used for anything but Unlock memberships. We strongly discourage users from using them for anything that's not Unlock related. These accounts, and the associated wallets should only be considered as "identities" and not as ways to hold currencies. As a matter of fact, we never use them to send transactions or even send them funds.

Since they are intended for people who do not have a crypto wallet, they will only ever be granted NFT memberships that were purchased through credit card transactions. It is important to note that in that case, the NFTs are not transferable or cancellable, which means that the accounts that "holds" them is not actually able to make transactions with them.

Finally, we currently treat the email inbox of the user as a "trusted" origin, which means that if a user's email inbox gets compromised, they should consider their Unlock to be potentially compromised and immediately change their password.

For users who are locked out of their accounts, we can still transfer their NFT memberships to another account if they contact our support.
