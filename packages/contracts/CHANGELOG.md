# CHANGELOG

## 0.0.32

- PublicLock v15 : Minor changes to reduce contract size (see (https://github.com/unlock-protocol/unlock/pull/15242)[#15242])
- Unlock v14: fix a typo (see #15110)

## 0.0.31

- Add `PublicLock v15` and `Unlock v14`

**Features**

- remember referrer for renewals (#15017) - the referrer address set during the first purchase is now automatically reused when a key is renewed (for subscriptions)
- burn / disable a lock entirely (#15018) - “burning” a lock will disbale all features and make existing data inaccessible. To date, this can NOT be reversed (even though nothing is deleted from chain storage).
- Purchase multiple periods at once (#14845) - one can chose to buy directly several periods for a key during a single purchase
- update reward computation to be based on protocol fee (#14696) - the gov tokens reward is now based on a fraction of the protocol fee - more precisely: the amount of governance tokens distributed is equal to half the protocol fee
- add `hasRole` hook (#14829) - a new hook can be used to set programmatically a role based on a 3rd part custom contract
- dissociate `referrer` from `protocolReferrer` (#15042) - allow to specify different addresses to perceive referrer fees and governance token reward

**Minor / internal changes**

- adding the ability to execute more tx as part of a deployment. (#14877) - some actions can now be added directly to the transaction where a lock is created (for instance, set another lock manager, etc).
- use struct to parse purchase args (#14806) - we use a new signature to parse purchase arguments, more flexible and clearer
- emit `PaymentReceipt` event (#14832)
- add `ReferrerPaid` event (#14827)
- replace `udt` by `governanceToken` in Unlock contract (#14688) (`udt` has been kept for backwards compatibility reasons)

**Fixes**

- owners count excludes the zero address (#14828)
- lower contract size for PublicLock v15 (#14846) removes `addLockManager` shorthand
- wrong token id after a key was burnt (#15071)

## 0.0.30

- Remove deprecated versions of `Unlock` (from V0 to v10)
- Remove deprecated versions of `PublicLock` (from V0 to v7)

## 0.0.29

- Adding `EmptyImpl` in `utils` to allow deploymeny of empty proxy
- Update `UPToken` and `UPSwap` initialization logic

## 0.0.28

- Adding the `Kickback.sol` contract used to create refunds for event attendees.

## 0.0.27

- add `UPToken`, `UPGovernor`, `UPTimelock` and `UPSwap` contracts

## 0.0.26

- update `UniswapOracleV3` to allow pool fee to be passed in constructor

## 0.0.25

- update `UnlockSwapBurner` to latest version using Uniswap `UniversalRouter`

## 0.0.22-0.0.24

- add `contracts` alias for all versions
- add `PublicLock` and `Unlock` alias for all versions
- add version numbers as constant

## 0.0.21

- release fix post-attack on Fri Apr 21st 2023 #11690

## 0.0.20

- release storage slot fix for PublicLock V13 #11665

## 0.0.19

- improve docstrings and fix some typo in IUnlock and IPublicLock interfaces

## 0.0.18

- PublicLockV13: update hardcoded Unlock mainnet address with redeployed version

## 0.0.17

PublicLockV13 & UnlockV12:

- upgrade of OpenZeppelin contracts to 4.8.2 ([#11512](https://github.com/unlock-protocol/unlock/pull/11512))
- removal of unused Uniswap interfaces from Unlock ([#11427](https://github.com/unlock-protocol/unlock/pull/11427))
- changes in `receive` ([#11510](https://github.com/unlock-protocol/unlock/pull/11510))
- changes in `addLockTemplate` logic ([#11436](https://github.com/unlock-protocol/unlock/pull/11436))

## 0.0.16

- added PublicLock v13 and Unlock v12

## 0.0.17

- added PublicLock v14 and Unlock v13
