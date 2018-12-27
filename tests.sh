# Runs all the tests!

# Note: explicit || exit 1 is important (but brittle) https://github.com/unlock-protocol/unlock/issues/194

# Solidity tests
cd /home/unlock/smart-contracts
npm ci
CI=1 npm run ci

# React application
cd /home/unlock/unlock-app
npm ci
CI=1 npm run ci
