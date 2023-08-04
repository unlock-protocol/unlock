---
title: Hooks
description: >-
  Hooks are a low-level way to customize how a specific public lock smart contract behaves. Here are some tutorials on how to create custom hooks for your locks!
---

Hooks can be set on a lock by any _lock manager_ using the `setEventHooks` function. This function takes the addresses of contracts for any of the hooks to be used. The same contract can implement multiple hooks! Read more about the interfaces on the [core protocol docs](/core-protocol/public-lock/hooks).

In this section, we provide step-by-step guides on how to build custom hooks.
