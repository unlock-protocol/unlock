# Solidity API

## ILockKeyExtendHook

Functions to be implemented by a keyExtendHook.

_Lock hooks are configured by calling `setEventHooks` on the lock._

### onKeyExtend

```solidity
function onKeyExtend(uint256 tokenId, address from, uint256 newTimestamp, uint256 prevTimestamp) external
```

This hook every time a key is extended.

#### Parameters

| Name          | Type    | Description                                               |
| ------------- | ------- | --------------------------------------------------------- |
| tokenId       | uint256 | tje id of the key                                         |
| from          | address | the msg.sender making the purchase                        |
| newTimestamp  | uint256 | the new expiration timestamp after the key extension      |
| prevTimestamp | uint256 | the expiration timestamp of the key before being extended |
