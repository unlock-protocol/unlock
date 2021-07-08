# Various scripts to manage the contracts

## UDT Upgrade


### Whats happening

The v1 of the UDT contract was importing contracts from `@openzeppelin/contracts-ethereum-package` which rely solidity 0.5.17. In order to support the Compoud-like governance extension provided by `@openzeppelin/contracts-upgradeable` an upgrade is required. 

The upgrade requires a few changes, namely

1. upgrade solidity pragma to `^0.8.0` 
2. renaming of the initialization function to support `@openzeppelin/upgrades` pattern (i.e. from `_initialize` to `initialize`)
3. adding some gaps to prevent future conflicts in storage (i.e. a variable named `____gap`)

### How to solve it

@Amxx provided a template (ba7da40868e861aac015cd95910cdbb6c28ac27f) to proceed with the upgrade consisting of:

1. create `ERC20Patched.template.sol` with a new version of the contract that import the deprecated lib (i.e. `@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol`)  
2. flatten `ERC20Patched.template.sol` into `contracts/ERC20Patched.generated.sol`
3. remove duplicated licenses (hardhat doesnt support them)
4. manually correct the issues in the generated file.  Corrections are saved as `contracts/ERC20Patched.ref`)
1. generate a patch containing the changes 
```
diff -u contracts/ERC20Patched.ref contracts/ERC20Patched.generated.sol > genV2/ERC20Patched.patch
```
6. create a script that replay steps 1-3 and apply the patch to generate the new version of the contract

```sh
sh udt-upgrade-to-v2.sh
```

