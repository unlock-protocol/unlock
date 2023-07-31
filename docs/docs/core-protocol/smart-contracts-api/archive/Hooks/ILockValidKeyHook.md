# ILockValidKeyHook





Functions to be implemented by a hasValidKey Hook.

*Lock hooks are configured by calling `setEventHooks` on the lock.*

## Methods

### hasValidKey

```solidity
function hasValidKey(address lockAddress, address keyOwner, uint256 expirationTimestamp, bool isValidKey) external view returns (bool)
```

If the lock owner has registered an implementer then this hook is called every time balanceOf is called



#### Parameters

| Name | Type | Description |
|---|---|---|
| lockAddress | address | the address of the current lock |
| keyOwner | address | the potential owner of the key for which we are retrieving the `balanceof` |
| expirationTimestamp | uint256 | the key expiration timestamp |
| isValidKey | bool | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




