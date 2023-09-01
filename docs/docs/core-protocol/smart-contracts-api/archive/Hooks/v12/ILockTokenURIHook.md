# ILockTokenURIHook





Functions to be implemented by a tokenURIHook.

*Lock hooks are configured by calling `setEventHooks` on the lock.*

## Methods

### tokenURI

```solidity
function tokenURI(address lockAddress, address operator, address owner, uint256 keyId, uint256 expirationTimestamp) external view returns (string)
```

If the lock owner has registered an implementer then this hook is called every time `tokenURI()` is called



#### Parameters

| Name | Type | Description |
|---|---|---|
| lockAddress | address | the address of the lock |
| operator | address | the msg.sender issuing the call |
| owner | address | the owner of the key for which we are retrieving the `tokenUri` |
| keyId | uint256 | the id (tokenId) of the key (if applicable) |
| expirationTimestamp | uint256 | the key expiration timestamp |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | the tokenURI |




