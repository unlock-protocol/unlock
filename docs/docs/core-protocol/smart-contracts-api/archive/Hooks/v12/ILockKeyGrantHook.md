# Solidity API

## ILockKeyGrantHook

Functions to be implemented by a KeyGrantedHook.

_Lock hooks are configured by calling `setEventHooks` on the lock._

### onKeyGranted

```solidity
function onKeyGranted(uint256 tokenId, address from, address recipient, address keyManager, uint256 expiration) external
```

If the lock owner has registered an implementer then this hook
is called with every key granted.

_the lock's address is the `msg.sender` when this function is called_

#### Parameters

| Name       | Type    | Description                             |
| ---------- | ------- | --------------------------------------- |
| tokenId    | uint256 | the id of the granted key               |
| from       | address | the msg.sender granting the key         |
| recipient  | address | the account which will be granted a key |
| keyManager | address | an additional keyManager for the key    |
| expiration | uint256 | the expiration timestamp of the key     |
