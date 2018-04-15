# Runs all the tests!

# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
npm install
truffle test --network test

# React tests
cd /home/unlock/unlock-app
CI=1 npm test
