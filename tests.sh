# Runs all the tests!

# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
npm install
truffle test --network test
npm run lint

# React tests && linting
cd /home/unlock/unlock-app
npm install
CI=1 npm test
npm run lint

