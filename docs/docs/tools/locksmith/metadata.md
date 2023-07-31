---
title: Metadata
description: A guide to using off-chain metadata with Unlock Protocol.
---

# Metadata

## Kinds of Metadata

Unlock keeps track of off-chain metadata in two different ways, depending on what the metadata is attached to.

### Key-Specific Metadata

This metadata belongs to a specific key, and it persists no matter who owns it. For example, think of a key that serves as a ticket to an in-person event. Some interesting metadata this key can hold is whether or not it has been checked in. When someone checks in to the event, their key is "marked" to indicate that it has already been used.

This information should stick around forever. You don't want someone to transfer the key to another person who will try to check in with it!


> Key-specific metadata is about the key itself, not the key holder.


### User-Specific Metadata

This metadata relates to a key holder for a lock, no matter which key they have. For example, think of a key that serves as a subscription to a newsletter. The publisher of the newsletter probably wants to send email updates to current key holders. If a user's email address is stored as user-specific metadata, the lock owner can send updates.

Email addresses are quasi-private information, however. If a key gets transferred, we don't want to transfer the email address (or anything else specific to a user) along with it. User-specific metadata doesn't transfer with a key.


> User-specific metadata is about the key holder, not about the specific instance of a key.


## Accessing Metadata

### Access Control

Some information is meant to be shared, but much information should be kept private. To this end, user-specific metadata is scoped to 2 different access levels.

1. Public - visible to anyone who requests it
2. Protected - visible only to the user and the lock owner, this access is enforced by signature verification.


> Only authenticated lock owners can write key-specific metadata. Only authenticated users can write their own user-specific metadata.

> Only authenticated lock owners and authenticated users can read protected user-specific metadata.


### The Members Page

Each lock on the dashboard shows a link to the associated Members page.

Lock owners can view the user-specific metadata for all key holders on a lock on the Members page associated with that lock. On visiting that page, the lock owner will be prompted by their wallet to sign a message verifying their identity. When they have authenticated, they will see the public and private metadata for each key holder.

Unauthenticated visitors to that page will only see public metadata, including some default fields that are on all keys: the lock name, the keyholder address, and the expiration date of the key.
