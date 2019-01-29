### Lock Versions

As the lock contract evolves, there will likely be some changes which break the front-end integration. When this occurs, we will bump the version number on the lock contract itself. For ease of reviewing changes, the process might look like this:

#### PR 1/2

- the old lock version (ie: `PublicLock.sol`) is copied & pasted into a new file (`oldPublicLock.sol`) in the `smart-contracts/old_lock_versions` directory so we keep it for reference.
- the old lock version has its name changed to reflect the new version we're about to update to (ie: `PublicLockV1.sol`).

#### PR 2/2

- the version number for the new Lock contract is edited in `Unlock.sol.createLock()`.
- Unlock is Upgraded using zos so that it will start to deploy the new lock version moving forward.
