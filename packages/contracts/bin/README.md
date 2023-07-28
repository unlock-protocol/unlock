## Flattened contracts

The different versions of the contract have been flattened from commit history using hardhat.

NB: These files are used to test upgrades from successive versions.

**NB: sol files v2 and v5 could not be flattened (Error HH603: Hardhat flatten doesn't support cyclic dependencies).**

### Flatten the contracts

You can reproduce the steps by running the following script.

```
sh ./flatten-past-versions.sh
```
