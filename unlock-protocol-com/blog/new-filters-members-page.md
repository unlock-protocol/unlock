---
title: Members page Filters
subTitle: A new way to filter keys in the members page
authorName: Kalidou Diagne
publishDate: September 8, 2022
description: Unlock introduce a new set of filters to improve search experience.
image: /images/blog/new-filters-members-page/filter-overview.png
---

Our Members page is now improved with more specific filters, that now makes more simplier to find a specific key.
We have introduced filters that let you find specific memberships by `owner`, `toked id`, `check-in time`, `type of expiration`, and `email`.

### Filter selection

![Filter selection](/images/blog/new-filters-members-page/filter-selection.png)

When a filter is selected you will be able to see a input or a dropdown (with a set of default values) based on the active filter.

![Filter by owner](/images/blog/new-filters-members-page/filter-by-owner.png)

### Filters in details

#### Owner

This filter refers to public address, you will be able to filter by partial text or also with ens domain.

![Filter by owner](/images/blog/new-filters-members-page/filter-by-owner-partial.png)

#### Token id

This filter refers to token id, you will be able to filter by a specific token id.

![Filter by owner token id](/images/blog/new-filters-members-page/filter-by-token-id.png)

#### Check in time

This filter shows all keys marked as checked in.

_Only lock manager are able to see this filter because checked in time is a protected data._

![Filter by checked in](/images/blog/new-filters-members-page/filter-checked-in.png)

#### Email

This filter refers to email, and gives the ability to search a key by email if present in the metadata.

_Only lock manager are able to see this filter because email is a protected data._

![Filter by email](/images/blog/new-filters-members-page/filter-by-email.png)

#### Expiration

This filters refers to expiration status, when active you can choose between 3 default values:

- `ALL` to show all the keys without any distiction
- `EXPIRED` to show all the expired keys
- `ACTIVE` to show all the keys that are still valid

![Filter by expiration](/images/blog/new-filters-members-page/filter-by-expiration.png)

## What if I find an issue or bug in the new checkout?

Please open an issue on Github or tell us in the Discord and we'll fix it ASAP.
