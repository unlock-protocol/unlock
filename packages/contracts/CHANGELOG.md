# CHANGELOG

## 0.0.31

- Add `PublicLock v15` and `Unlock v14`

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
