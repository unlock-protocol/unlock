---
title: Members Page Filters
subTitle: A new way to filter keys in the members page
authorName: Kalidou Diagne
publishDate: September 8, 2022
description: Unlock introduces a new set of filters to improve the search experience.
image: /images/blog/new-filters-members-page/filter-overview.png
---

Our Members page is now improved with more specific filters, which makes finding specific memberships much easier.
We have introduced filters that let you find specific memberships by `owner`, `token id`, `check-in time`, `type of expiration`, and `email`.

### Filter selection

![Filter selection](/images/blog/new-filters-members-page/filter-selection.png)

When a filter is selected the user will see an input or a dropdown (with a set of default values) that lets them enter the specific values they are looking for.

![Filter by owner](/images/blog/new-filters-members-page/filter-by-owner.png)

### Filters in detail

#### Owner

This filter refers to the public wallet address. The user will be able to filter by partial (`0x123` to find all addresses that start with `0x123`) text or also with an [ENS domain](https://ens.domains/).

![Filter by owner](/images/blog/new-filters-members-page/filter-by-owner-partial.png)

#### Token id

This filter refers to token id, the user will be able to filter by a specific token id.

![Filter by owner token id](/images/blog/new-filters-members-page/filter-by-token-id.png)

#### Check in time

This filter shows all keys marked as checked in. This is useful for conferences that are trying to list all ticket holders who attended the event.

_Only lock managers are able to see this filter because checked in time is protected data._

![Filter by checked in](/images/blog/new-filters-members-page/filter-checked-in.png)

#### Email

This filter refers to the email address of the key owner if it was [collected during checkout](https://docs.unlock-protocol.com/tools/checkout/collecting-metadata), and gives the ability to search a key by email if present in the metadata.

_Only lock managers are able to see this filter because email is protected data._

![Filter by email](/images/blog/new-filters-members-page/filter-by-email.png)

#### Expiration

This filter refers to expiration status; when active you can choose between 3 default values:

- `ALL` to show all the keys without any distiction
- `EXPIRED` to show all the expired keys
- `ACTIVE` to show all the keys that are still valid

![Filter by expiration](/images/blog/new-filters-members-page/filter-by-expiration.png)

## What if I find an issue or bug in the new filters?

Please open an issue on Github or tell us in the Discord and we'll fix it ASAP.
