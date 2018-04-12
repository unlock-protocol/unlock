# Runs all the tests!

# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
#npm install -g babel-register babel-polyfill
npm install
truffle test --network test

# React tests
