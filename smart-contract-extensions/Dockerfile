FROM unlock-core

# Dependencies for smart-contracts
RUN mkdir /home/unlock/smart-contract-extensions
COPY --chown=node yarn.lock /home/unlock/smart-contract-extensions/.
COPY --chown=node package.json /home/unlock/smart-contract-extensions/.
WORKDIR /home/unlock/smart-contract-extensions
RUN yarn --production

# Build smart contract
COPY --chown=node . /home/unlock/smart-contract-extensions/.
RUN yarn build
