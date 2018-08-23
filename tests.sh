# Runs all the tests!

# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
npm install

# Note: explicit || exit 1 is important (but brittle) https://github.com/unlock-protocol/unlock/issues/194
truffle test --network test || exit 1
npm run lint

# React tests && linting
cd /home/unlock/unlock-app
npm install
CI=1 npm test
npm run lint

